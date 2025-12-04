"""Dashboard analytics schemas."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class CourseAnalytics(BaseModel):
    course_id: UUID
    title: str
    enrollment_count: int
    completion_rate: float


class ProgressOverview(BaseModel):
    enrollment_id: UUID
    course_id: UUID
    course_title: str
    progress_percent: float
    last_viewed: datetime | None = None


class StudentDashboard(BaseModel):
    enrolled_courses: int
    completed_courses: int
    total_lessons_completed: int
    recent_activity: list[dict] = Field(default_factory=list)
    progress_overview: list[ProgressOverview] = Field(default_factory=list)


class InstructorDashboard(BaseModel):
    total_courses: int
    total_students: int
    average_completion_rate: float
    courses: list[CourseAnalytics] = Field(default_factory=list)
