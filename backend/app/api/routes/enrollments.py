"""Enrollment and learning progress routes."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_user_from_token, require_role
from app.db.session import get_session
from app.models import Course, CourseStatus, Enrollment, EnrollmentStatus, Lesson, LessonProgress, User, UserRole
from app.schemas import CertificateRead, EnrollmentCreate, EnrollmentRead, LessonProgressRead, ProgressUpdate


router = APIRouter(prefix="/enrollments", tags=["enrollments"])


@router.post("", response_model=EnrollmentRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_role(UserRole.STUDENT, UserRole.ADMIN))])
async def enroll_in_course(
    payload: EnrollmentCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_user_from_token),
) -> EnrollmentRead:
    """Enroll the current student in a course."""

    course = await session.get(Course, payload.course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    if course.status != CourseStatus.PUBLISHED and current_user.role == UserRole.STUDENT:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Course not open for enrollment")

    existing = await session.execute(
        select(Enrollment).where(
            Enrollment.course_id == payload.course_id, Enrollment.student_id == current_user.id
        )
    )
    if existing.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already enrolled in this course")

    # Create enrollment with status as string value to match database enum
    enrollment = Enrollment(
        course_id=payload.course_id,
        student_id=current_user.id,
        status=EnrollmentStatus.ACTIVE.value  # Use enum value (lowercase "active")
    )
    session.add(enrollment)
    await session.commit()
    await session.refresh(enrollment)
    return EnrollmentRead.model_validate(enrollment)


@router.get("/me", response_model=list[EnrollmentRead], dependencies=[Depends(require_role(UserRole.STUDENT, UserRole.ADMIN))])
async def my_enrollments(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_user_from_token),
) -> list[EnrollmentRead]:
    """Return enrollments for the current student."""

    enrollments = (
        await session.execute(select(Enrollment).where(Enrollment.student_id == current_user.id))
    ).scalars().all()
    return [EnrollmentRead.model_validate(enrollment) for enrollment in enrollments]


@router.get(
    "/course/{course_id}",
    response_model=list[EnrollmentRead],
    dependencies=[Depends(require_role(UserRole.INSTRUCTOR, UserRole.ADMIN))],
)
async def course_enrollments(
    course_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_user_from_token),
) -> list[EnrollmentRead]:
    """Return enrollments for a course the instructor owns."""

    course = await session.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    if current_user.role != UserRole.ADMIN and course.instructor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot view enrollments for this course")

    enrollments = (
        await session.execute(select(Enrollment).where(Enrollment.course_id == course_id))
    ).scalars().all()
    return [EnrollmentRead.model_validate(enrollment) for enrollment in enrollments]


@router.post(
    "/{enrollment_id}/progress",
    response_model=EnrollmentRead,
    dependencies=[Depends(require_role(UserRole.STUDENT, UserRole.ADMIN))],
)
async def update_progress(
    enrollment_id: uuid.UUID,
    payload: ProgressUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_user_from_token),
) -> EnrollmentRead:
    """Mark lesson completion for an enrollment and update progress."""

    enrollment = await session.get(Enrollment, enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")
    if current_user.role != UserRole.ADMIN and enrollment.student_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot update this enrollment")

    lesson = await session.get(Lesson, payload.lesson_id)
    if not lesson or lesson.course_id != enrollment.course_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Lesson not part of this course")

    # Check if trying to mark as complete - validate sequential completion
    if payload.is_completed:
        # Get all lessons in the course, ordered by position
        all_lessons = (
            await session.execute(
                select(Lesson)
                .where(Lesson.course_id == enrollment.course_id)
                .order_by(Lesson.position)
            )
        ).scalars().all()
        
        # Find lessons with position less than current lesson
        previous_lessons = [l for l in all_lessons if l.position < lesson.position]
        
        if previous_lessons:
            # Get all completed lessons for this enrollment
            completed_progress = (
                await session.execute(
                    select(LessonProgress)
                    .where(
                        LessonProgress.enrollment_id == enrollment_id,
                        LessonProgress.is_completed.is_(True)
                    )
                )
            ).scalars().all()
            completed_lesson_ids = {p.lesson_id for p in completed_progress}
            
            # Check if all previous lessons are completed
            for prev_lesson in previous_lessons:
                if prev_lesson.id not in completed_lesson_ids:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Please complete lesson {prev_lesson.position} ({prev_lesson.title}) before marking this lesson as complete."
                    )

    progress = (
        await session.execute(
            select(LessonProgress).where(
                LessonProgress.enrollment_id == enrollment_id,
                LessonProgress.lesson_id == payload.lesson_id,
            )
        )
    ).scalars().first()

    if not progress:
        progress = LessonProgress(
            enrollment_id=enrollment_id,
            lesson_id=payload.lesson_id,
            is_completed=payload.is_completed,
            completed_at=datetime.now(timezone.utc) if payload.is_completed else None,
        )
        session.add(progress)
    else:
        progress.is_completed = payload.is_completed
        progress.completed_at = datetime.now(timezone.utc) if payload.is_completed else None
        session.add(progress)

    await session.flush()

    total_lessons = (
        await session.execute(select(Lesson).where(Lesson.course_id == enrollment.course_id))
    ).scalars().all()
    completed_lessons = (
        await session.execute(
            select(LessonProgress)
            .where(LessonProgress.enrollment_id == enrollment_id, LessonProgress.is_completed.is_(True))
        )
    ).scalars().all()

    if total_lessons:
        enrollment.progress_percent = round(len(completed_lessons) / len(total_lessons) * 100, 2)
    else:
        enrollment.progress_percent = 0.0

    # Convert enum to string value for database
    if enrollment.progress_percent >= 100:
        enrollment.status = EnrollmentStatus.COMPLETED.value
    else:
        enrollment.status = EnrollmentStatus.ACTIVE.value

    session.add(enrollment)
    await session.commit()
    await session.refresh(enrollment)
    return EnrollmentRead.model_validate(enrollment)


@router.get(
    "/{enrollment_id}/progress",
    response_model=list[LessonProgressRead],
    dependencies=[Depends(require_role(UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN))],
)
async def list_progress(
    enrollment_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_user_from_token),
) -> list[LessonProgressRead]:
    """Return lesson progress for an enrollment."""

    enrollment = await session.get(Enrollment, enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")
    if current_user.role == UserRole.STUDENT and enrollment.student_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot view this enrollment")

    progress_rows = (
        await session.execute(select(LessonProgress).where(LessonProgress.enrollment_id == enrollment_id))
    ).scalars().all()
    return [LessonProgressRead.model_validate(progress) for progress in progress_rows]


@router.get(
    "/{enrollment_id}/certificate",
    response_model=CertificateRead,
    dependencies=[Depends(require_role(UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN))],
)
async def get_certificate(
    enrollment_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_user_from_token),
) -> CertificateRead:
    """Return a completion certificate for finished enrollments."""

    enrollment = await session.get(Enrollment, enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")

    course = await session.get(Course, enrollment.course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    student = await session.get(User, enrollment.student_id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    if current_user.role == UserRole.STUDENT and enrollment.student_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot view this certificate")
    if current_user.role == UserRole.INSTRUCTOR and course.instructor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot view certificates for this course")

    if enrollment.progress_percent < 100 or enrollment.status != EnrollmentStatus.COMPLETED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Certificate available after course completion")

    return CertificateRead(
        enrollment_id=enrollment.id,
        course_id=course.id,
        course_title=course.title,
        student_id=student.id,
        student_name=student.full_name,
        issued_at=enrollment.updated_at or datetime.now(timezone.utc),
        progress_percent=enrollment.progress_percent,
    )
