"""User profile and dashboard routes."""

from statistics import mean
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_user_from_token
from app.db.session import get_session
from app.models import Course, Enrollment, EnrollmentStatus, LessonProgress, User, UserRole
from app.schemas import (
    CourseAnalytics,
    InstructorDashboard,
    ProfileRead,
    ProfileUpdate,
    ProgressOverview,
    StudentDashboard,
    UserRead,
)


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=ProfileRead)
async def read_current_user(current_user: User = Depends(get_user_from_token)) -> ProfileRead:
    """Return current authenticated user's profile."""

    return ProfileRead.model_validate(current_user)


@router.put("/me", response_model=ProfileRead)
async def update_profile(
    payload: ProfileUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_user_from_token),
) -> ProfileRead:
    """Update user profile fields."""

    from datetime import datetime
    
    update_data = payload.model_dump(exclude_unset=True)
    
    # Handle date_of_birth conversion from string to datetime
    if "date_of_birth" in update_data and update_data["date_of_birth"]:
        try:
            # Try ISO format first (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)
            update_data["date_of_birth"] = datetime.fromisoformat(update_data["date_of_birth"].replace('Z', '+00:00'))
        except (ValueError, TypeError, AttributeError):
            try:
                # Try simple date format YYYY-MM-DD
                update_data["date_of_birth"] = datetime.strptime(update_data["date_of_birth"], '%Y-%m-%d')
            except (ValueError, TypeError):
                update_data["date_of_birth"] = None
    elif "date_of_birth" in update_data and update_data["date_of_birth"] is None:
        update_data["date_of_birth"] = None
    
    for field, value in update_data.items():
        setattr(current_user, field, value)

    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)
    return ProfileRead.model_validate(current_user)


@router.get("/me/dashboard", response_model=StudentDashboard | InstructorDashboard)
async def dashboard(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_user_from_token),
) -> StudentDashboard | InstructorDashboard:
    """Return dashboard data tailored to the user's role."""

    if current_user.role == UserRole.INSTRUCTOR:
        return await _instructor_dashboard(session, current_user.id)
    if current_user.role == UserRole.STUDENT:
        return await _student_dashboard(session, current_user.id)
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported user role")


async def _student_dashboard(session: AsyncSession, user_id: UUID) -> StudentDashboard:
    """Compute student dashboard metrics."""

    enrollments = (
        await session.execute(select(Enrollment).where(Enrollment.student_id == user_id))
    ).scalars().all()

    enrollment_ids = [enrollment.id for enrollment in enrollments]
    progress_rows = []
    if enrollment_ids:
        progress_rows = (
            await session.execute(
                select(LessonProgress)
                .where(LessonProgress.enrollment_id.in_(enrollment_ids))
                .order_by(LessonProgress.completed_at.desc().nullslast())
            )
        ).scalars().all()

    enrolled_courses = len(enrollments)
    completed_courses = sum(1 for enrollment in enrollments if enrollment.status == EnrollmentStatus.COMPLETED)
    total_lessons_completed = sum(1 for progress in progress_rows if progress.is_completed)

    recent_activity: list[dict] = []
    for progress in progress_rows[:5]:
        recent_activity.append(
            {
                "lesson_id": progress.lesson_id,
                "completed_at": progress.completed_at,
            }
        )

    overviews: list[ProgressOverview] = []
    course_titles: dict[UUID, str] = {}
    if enrollments:
        course_ids = [enrollment.course_id for enrollment in enrollments]
        course_objects = (
            await session.execute(select(Course).where(Course.id.in_(course_ids)))
        ).scalars().all()
        course_titles = {course.id: course.title for course in course_objects}

        for enrollment in enrollments:
            # Get completed_at timestamps for this enrollment, filtering out None values
            enrollment_progress_dates = [
                progress.completed_at 
                for progress in progress_rows 
                if progress.enrollment_id == enrollment.id and progress.completed_at is not None
            ]
            last_viewed = max(enrollment_progress_dates) if enrollment_progress_dates else None
            
            overviews.append(
                ProgressOverview(
                    enrollment_id=enrollment.id,
                    course_id=enrollment.course_id,
                    course_title=course_titles.get(enrollment.course_id, ""),
                    progress_percent=enrollment.progress_percent,
                    last_viewed=last_viewed,
                )
            )

    return StudentDashboard(
        enrolled_courses=enrolled_courses,
        completed_courses=completed_courses,
        total_lessons_completed=total_lessons_completed,
        recent_activity=recent_activity,
        progress_overview=overviews,
    )


async def _instructor_dashboard(session: AsyncSession, user_id: UUID) -> InstructorDashboard:
    """Compute instructor dashboard metrics."""

    courses = (
        await session.execute(select(Course).where(Course.instructor_id == user_id))
    ).scalars().all()

    course_ids = [course.id for course in courses]
    enrollment_rows = []
    if course_ids:
        enrollment_rows = (
            await session.execute(select(Enrollment).where(Enrollment.course_id.in_(course_ids)))
        ).scalars().all()

    total_students = len({enrollment.student_id for enrollment in enrollment_rows})
    completion_rates = [enrollment.progress_percent for enrollment in enrollment_rows]
    average_completion_rate = float(mean(completion_rates)) if completion_rates else 0.0

    course_metrics: list[CourseAnalytics] = []
    for course in courses:
        course_enrollments = [enrollment for enrollment in enrollment_rows if enrollment.course_id == course.id]
        completions = [enrollment.progress_percent for enrollment in course_enrollments]
        completion_rate = float(mean(completions)) if completions else 0.0
        course_metrics.append(
            CourseAnalytics(
                course_id=course.id,
                title=course.title,
                enrollment_count=len(course_enrollments),
                completion_rate=completion_rate,
            )
        )

    return InstructorDashboard(
        total_courses=len(courses),
        total_students=total_students,
        average_completion_rate=average_completion_rate,
        courses=course_metrics,
    )
