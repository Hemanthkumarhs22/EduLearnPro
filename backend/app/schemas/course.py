"""Course schemas."""

from uuid import UUID

from pydantic import BaseModel, Field

from app.models import CourseLevel, CourseStatus
from app.schemas.lesson import LessonRead
from app.schemas.base import ORMModel


class CourseBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    category: str = Field(..., min_length=2, max_length=100)
    level: CourseLevel = Field(default=CourseLevel.BEGINNER)
    status: CourseStatus = Field(default=CourseStatus.DRAFT)
    thumbnail_url: str | None = None


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    description: str | None = Field(default=None, min_length=10)
    category: str | None = Field(default=None, min_length=2, max_length=100)
    level: CourseLevel | None = None
    status: CourseStatus | None = None
    thumbnail_url: str | None = None


class CourseRead(CourseBase, ORMModel):
    id: UUID
    instructor_id: UUID


class CourseDetail(CourseRead):
    lessons: list[LessonRead] = Field(default_factory=list)


class CourseSummary(BaseModel):
    id: UUID
    title: str
    description: str
    category: str
    level: CourseLevel
    status: CourseStatus
    thumbnail_url: str | None = None
    enrollment_count: int = 0
