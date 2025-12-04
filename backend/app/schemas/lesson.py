"""Lesson schemas."""

from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.base import ORMModel


class LessonBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    content: str
    video_url: str | None = None
    thumbnail_url: str | None = None
    position: int = 0


class LessonCreate(LessonBase):
    course_id: UUID


class LessonUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    content: str | None = None
    video_url: str | None = None
    thumbnail_url: str | None = None
    position: int | None = None


class LessonRead(LessonBase, ORMModel):
    id: UUID
    course_id: UUID
