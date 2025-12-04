from __future__ import annotations

"""Enrollment and progress models."""

import uuid
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum as SQLEnum, Float, ForeignKey, String, TypeDecorator, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


if TYPE_CHECKING:  # pragma: no cover
    from .course import Course
    from .lesson import Lesson
    from .user import User


class EnrollmentStatus(str, Enum):  # type: ignore[misc]
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class EnumValueType(TypeDecorator):
    """Convert enum to its value (lowercase string) for database storage."""
    
    impl = String
    cache_ok = True
    
    def __init__(self, enum_class, *args, **kwargs):
        self.enum_class = enum_class
        self.enum_name = kwargs.pop('name', None) or f"{enum_class.__name__.lower()}"
        super().__init__(*args, **kwargs)
    
    def load_dialect_impl(self, dialect):
        # For PostgreSQL, we'll use String and cast to enum in SQL
        # This allows us to pass string values directly
        return dialect.type_descriptor(String())
    
    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        # Convert enum to its value (lowercase string)
        if isinstance(value, Enum):
            return value.value
        # If it's already a string (enum value), return as-is
        return value
    
    def process_result_value(self, value, dialect):
        if value is None:
            return None
        # Convert database string back to enum
        if isinstance(value, str):
            # Handle both lowercase values and uppercase enum names from database
            value_lower = value.lower()
            # Try to find matching enum by value (lowercase)
            for enum_member in self.enum_class:
                if enum_member.value == value_lower:
                    return enum_member
            # Fallback: try direct conversion
            try:
                return self.enum_class(value_lower)
            except ValueError:
                # If still fails, try original value
                return self.enum_class(value)
        return value
    
    def bind_expression(self, bindvalue):
        # Cast the string value to the PostgreSQL enum type in SQL
        from sqlalchemy import cast
        from sqlalchemy.dialects.postgresql import ENUM
        return cast(bindvalue, ENUM(self.enum_class, name=self.enum_name, create_type=False))


class Enrollment(Base):
    """Join table representing student enrollment in a course."""

    __tablename__ = "enrollments"
    __table_args__ = (UniqueConstraint("student_id", "course_id", name="uq_enrollment_student_course"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), index=True
    )
    status: Mapped[EnrollmentStatus] = mapped_column(
        EnumValueType(EnrollmentStatus, name="enrollment_status"),
        default=EnrollmentStatus.ACTIVE
    )
    progress_percent: Mapped[float] = mapped_column(Float, default=0.0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    student: Mapped["User"] = relationship(back_populates="enrollments", lazy="joined")
    course: Mapped["Course"] = relationship(back_populates="enrollments", lazy="joined")
    lesson_progress: Mapped[list["LessonProgress"]] = relationship(
        back_populates="enrollment", cascade="all, delete-orphan", lazy="selectin"
    )


class LessonProgress(Base):
    """Track per-lesson completion for an enrollment."""

    __tablename__ = "lesson_progress"
    __table_args__ = (
        UniqueConstraint("enrollment_id", "lesson_id", name="uq_progress_enrollment_lesson"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    enrollment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("enrollments.id", ondelete="CASCADE"), index=True
    )
    lesson_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"), index=True
    )
    is_completed: Mapped[bool] = mapped_column(default=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    enrollment: Mapped[Enrollment] = relationship(back_populates="lesson_progress", lazy="joined")
    lesson: Mapped["Lesson"] = relationship(back_populates="progresses", lazy="joined")

    def __repr__(self) -> str:  # pragma: no cover
        return (
            "LessonProgress(" f"enrollment_id={self.enrollment_id}, "
            f"lesson_id={self.lesson_id}, completed={self.is_completed})"
        )
