"""Enrollment and progress schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.models import EnrollmentStatus
from app.schemas.lesson import LessonRead
from app.schemas.base import ORMModel


class EnrollmentBase(BaseModel):
    course_id: UUID


class EnrollmentCreate(EnrollmentBase):
    pass


class EnrollmentRead(ORMModel):
    id: UUID
    student_id: UUID
    course_id: UUID
    status: EnrollmentStatus
    progress_percent: float
    created_at: datetime
    updated_at: datetime | None = None


class EnrollmentDetail(EnrollmentRead):
    lessons: list[LessonRead] = Field(default_factory=list)


class LessonProgressRead(ORMModel):
    lesson_id: UUID
    is_completed: bool
    completed_at: datetime | None = None


class ProgressUpdate(BaseModel):
    lesson_id: UUID
    is_completed: bool = True


class CertificateRead(BaseModel):
    enrollment_id: UUID
    course_id: UUID
    course_title: str
    student_id: UUID
    student_name: str
    issued_at: datetime
    progress_percent: float
