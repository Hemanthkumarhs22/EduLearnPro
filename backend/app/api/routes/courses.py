"""Course management routes."""

import os
import uuid
from enum import Enum
from pathlib import Path
from typing import Annotated

import aiofiles
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.core.dependencies import get_user_from_token, require_role
from app.db.session import get_session
from app.models import Course, CourseStatus, Enrollment, User, UserRole
from app.schemas import CourseCreate, CourseDetail, CourseRead, CourseSummary, CourseUpdate, LessonRead


settings = get_settings()
router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("", response_model=list[CourseSummary])
async def list_courses(
    session: AsyncSession = Depends(get_session),
    search: str | None = None,
    category: str | None = None,
    level: str | None = None,
    status_filter: CourseStatus | None = None,
) -> list[CourseSummary]:
    """Return catalog of courses with optional filters."""

    # Use a subquery for enrollment count to avoid GROUP BY issues with relationships
    enrollment_subquery = (
        select(Enrollment.course_id, func.count(Enrollment.id).label("enrollment_count"))
        .group_by(Enrollment.course_id)
        .subquery()
    )

    query = (
        select(
            Course,
            func.coalesce(enrollment_subquery.c.enrollment_count, 0).label("enrollment_count")
        )
        .outerjoin(enrollment_subquery, enrollment_subquery.c.course_id == Course.id)
        .order_by(Course.created_at.desc())
    )

    if search:
        like_pattern = f"%{search.lower()}%"
        query = query.where(func.lower(Course.title).like(like_pattern))
    if category:
        query = query.where(func.lower(Course.category) == category.lower())
    if level:
        query = query.where(func.lower(Course.level) == level.lower())
    if status_filter:
        query = query.where(Course.status == status_filter)

    result = await session.execute(query)
    summaries: list[CourseSummary] = []
    for course, enrollment_count in result.all():
        summaries.append(
            CourseSummary(
                id=course.id,
                title=course.title,
                description=course.description,
                category=course.category,
                level=course.level,
                status=course.status,
                thumbnail_url=course.thumbnail_url,
                enrollment_count=int(enrollment_count) if enrollment_count else 0,
            )
        )
    return summaries


@router.get(
    "/mine",
    response_model=list[CourseRead],
    dependencies=[Depends(require_role(UserRole.INSTRUCTOR, UserRole.ADMIN))],
)
async def list_my_courses(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_user_from_token),
) -> list[CourseRead]:
    """Return courses owned by the current instructor."""

    courses = (
        await session.execute(select(Course).where(Course.instructor_id == current_user.id))
    ).scalars().all()
    return [
        CourseRead(
            id=course.id,
            title=course.title,
            description=course.description,
            category=course.category,
            level=course.level,
            status=course.status,
            thumbnail_url=course.thumbnail_url,
            instructor_id=course.instructor_id,
        )
        for course in courses
    ]


@router.post("", response_model=CourseRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_role(UserRole.INSTRUCTOR, UserRole.ADMIN))])
async def create_course(
    payload: CourseCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_user_from_token),
) -> CourseRead:
    """Create a new course."""
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Creating course with payload: {payload.model_dump()}")

    # Convert enum to its value (lowercase string) for database
    # This ensures we store the enum value, not the enum name
    level_value = payload.level.value if hasattr(payload.level, 'value') else str(payload.level)
    status_value = payload.status.value if hasattr(payload.status, 'value') else str(payload.status)
    
    logger.info(f"Converted level: {level_value}, status: {status_value}")
    
    course = Course(
        title=payload.title,
        description=payload.description,
        category=payload.category,
        level=level_value,  # Pass the string value (e.g., "beginner")
        status=status_value,  # Pass the string value (e.g., "draft")
        instructor_id=current_user.id,
        thumbnail_url=payload.thumbnail_url,
    )
    session.add(course)
    await session.commit()
    await session.refresh(course)
    return CourseRead(
        id=course.id,
        title=course.title,
        description=course.description,
        category=course.category,
        level=course.level,
        status=course.status,
        thumbnail_url=course.thumbnail_url,
        instructor_id=course.instructor_id,
    )


@router.get("/{course_id}", response_model=CourseDetail)
async def get_course(
    course_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
) -> CourseDetail:
    """Return course detail including lessons."""

    result = await session.execute(
        select(Course)
        .where(Course.id == course_id)
        .options(selectinload(Course.lessons))
    )
    course = result.scalars().first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    lessons = [
        LessonRead(
            id=lesson.id,
            title=lesson.title,
            content=lesson.content,
            video_url=lesson.video_url,
            position=lesson.position,
            course_id=lesson.course_id,
        )
        for lesson in course.lessons
    ]

    return CourseDetail(
        id=course.id,
        title=course.title,
        description=course.description,
        category=course.category,
        level=course.level,
        status=course.status,
        thumbnail_url=course.thumbnail_url,
        instructor_id=course.instructor_id,
        lessons=lessons,
    )


@router.put("/{course_id}", response_model=CourseRead, dependencies=[Depends(require_role(UserRole.INSTRUCTOR, UserRole.ADMIN))])
async def update_course(
    course_id: uuid.UUID,
    payload: CourseUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_user_from_token),
) -> CourseRead:
    """Update a course belonging to the instructor."""

    course = await session.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    if current_user.role != UserRole.ADMIN and course.instructor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot modify this course")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(course, key, value)

    session.add(course)
    await session.commit()
    await session.refresh(course)
    return CourseRead(
        id=course.id,
        title=course.title,
        description=course.description,
        category=course.category,
        level=course.level,
        status=course.status,
        thumbnail_url=course.thumbnail_url,
        instructor_id=course.instructor_id,
    )


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_role(UserRole.INSTRUCTOR, UserRole.ADMIN))])
async def delete_course(
    course_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_user_from_token),
) -> None:
    """Delete a course."""

    # Load course with relationships to ensure cascade delete works properly
    result = await session.execute(
        select(Course)
        .where(Course.id == course_id)
        .options(selectinload(Course.enrollments), selectinload(Course.lessons))
    )
    course = result.scalars().first()
    
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    if current_user.role != UserRole.ADMIN and course.instructor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete this course")

    await session.delete(course)
    await session.commit()


@router.post(
    "/{course_id}/thumbnail",
    response_model=CourseRead,
    dependencies=[Depends(require_role(UserRole.INSTRUCTOR, UserRole.ADMIN))],
)
async def upload_thumbnail(
    course_id: uuid.UUID,
    file: Annotated[UploadFile, File(...)],
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_user_from_token),
) -> CourseRead:
    """Upload and attach a thumbnail image for a course."""

    course = await session.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    if current_user.role != UserRole.ADMIN and course.instructor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot modify this course")

    extension = Path(file.filename or "thumbnail").suffix
    filename = f"{course.id}{extension}"
    media_path = Path("media/thumbnails")
    media_path.mkdir(parents=True, exist_ok=True)
    file_path = media_path / filename

    async with aiofiles.open(file_path, "wb") as buffer:
        content = await file.read()
        await buffer.write(content)

    course.thumbnail_url = f"/media/thumbnails/{filename}"
    session.add(course)
    await session.commit()
    await session.refresh(course)

    return CourseRead(
        id=course.id,
        title=course.title,
        description=course.description,
        category=course.category,
        level=course.level,
        status=course.status,
        thumbnail_url=course.thumbnail_url,
        instructor_id=course.instructor_id,
    )
