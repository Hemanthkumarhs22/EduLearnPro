from __future__ import annotations

"""Course model definition."""

import uuid
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum as SQLEnum, ForeignKey, String, Text, TypeDecorator, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:  # pragma: no cover
    from .enrollment import Enrollment
    from .lesson import Lesson
    from .user import User


class CourseLevel(str, Enum):  # type: ignore[misc]
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class CourseStatus(str, Enum):  # type: ignore[misc]
    DRAFT = "draft"
    PUBLISHED = "published"


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


class Course(Base):
    """Persisted course record."""

    __tablename__ = "courses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(length=200), index=True)
    description: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(length=100))
    level: Mapped[CourseLevel] = mapped_column(
        EnumValueType(CourseLevel, name="course_level")
    )
    status: Mapped[CourseStatus] = mapped_column(
        EnumValueType(CourseStatus, name="course_status"),
        default=CourseStatus.DRAFT
    )
    thumbnail_url: Mapped[str | None] = mapped_column(String(length=500), nullable=True)

    instructor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    instructor: Mapped["User"] = relationship(back_populates="owned_courses", lazy="joined")
    lessons: Mapped[list["Lesson"]] = relationship(
        back_populates="course", cascade="all, delete-orphan", order_by="Lesson.position", lazy="selectin"
    )
    enrollments: Mapped[list["Enrollment"]] = relationship(
        back_populates="course", cascade="all, delete-orphan", lazy="selectin"
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"Course(id={self.id}, title={self.title!r}, status={self.status})"
