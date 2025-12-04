"""Lesson management routes."""

import uuid
from pathlib import Path
from typing import Annotated

import aiofiles
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_user_from_token, require_role
from app.db.session import get_session
from app.models import Course, Lesson, User, UserRole
from app.schemas import LessonCreate, LessonRead, LessonUpdate


router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.post("", response_model=LessonRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_role(UserRole.INSTRUCTOR, UserRole.ADMIN))])
async def create_lesson(
    payload: LessonCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_user_from_token),
) -> LessonRead:
    """Create a lesson for a course."""

    course = await session.get(Course, payload.course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    if current_user.role != UserRole.ADMIN and course.instructor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot modify lessons for this course")

    lesson = Lesson(
        course_id=payload.course_id,
        title=payload.title,
        content=payload.content,
        video_url=payload.video_url,
        thumbnail_url=payload.thumbnail_url,
        position=payload.position,
    )
    session.add(lesson)
    await session.commit()
    await session.refresh(lesson)
    return LessonRead.model_validate(lesson)


@router.get("/course/{course_id}", response_model=list[LessonRead])
async def list_lessons(course_id: uuid.UUID, session: AsyncSession = Depends(get_session)) -> list[LessonRead]:
    """Return lessons for a course ordered by position."""

    lessons = (
        await session.execute(
            select(Lesson).where(Lesson.course_id == course_id).order_by(Lesson.position)
        )
    ).scalars().all()
    return [LessonRead.model_validate(lesson) for lesson in lessons]


@router.put("/{lesson_id}", response_model=LessonRead, dependencies=[Depends(require_role(UserRole.INSTRUCTOR, UserRole.ADMIN))])
async def update_lesson(
    lesson_id: uuid.UUID,
    payload: LessonUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_user_from_token),
) -> LessonRead:
    """Update a lesson."""

    lesson = await session.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    course = await session.get(Course, lesson.course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    if current_user.role != UserRole.ADMIN and course.instructor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot modify this lesson")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(lesson, key, value)

    session.add(lesson)
    await session.commit()
    await session.refresh(lesson)
    return LessonRead.model_validate(lesson)


@router.delete("/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_role(UserRole.INSTRUCTOR, UserRole.ADMIN))])
async def delete_lesson(
    lesson_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_user_from_token),
) -> None:
    """Delete a lesson."""

    lesson = await session.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    course = await session.get(Course, lesson.course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    if current_user.role != UserRole.ADMIN and course.instructor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete this lesson")

    await session.delete(lesson)
    await session.commit()


@router.post(
    "/{lesson_id}/thumbnail",
    response_model=LessonRead,
    dependencies=[Depends(require_role(UserRole.INSTRUCTOR, UserRole.ADMIN))],
)
async def upload_lesson_thumbnail(
    lesson_id: uuid.UUID,
    file: Annotated[UploadFile, File(...)],
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_user_from_token),
) -> LessonRead:
    """Upload and attach a thumbnail image for a lesson."""

    lesson = await session.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    course = await session.get(Course, lesson.course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    if current_user.role != UserRole.ADMIN and course.instructor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot modify this lesson")

    extension = Path(file.filename or "thumbnail").suffix
    filename = f"{lesson.id}{extension}"
    media_path = Path("media/lesson-thumbnails")
    media_path.mkdir(parents=True, exist_ok=True)
    file_path = media_path / filename

    async with aiofiles.open(file_path, "wb") as buffer:
        content = await file.read()
        await buffer.write(content)

    lesson.thumbnail_url = f"/media/lesson-thumbnails/{filename}"
    session.add(lesson)
    await session.commit()
    await session.refresh(lesson)

    return LessonRead.model_validate(lesson)
