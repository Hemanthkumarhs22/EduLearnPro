from __future__ import annotations

"""User model definition."""

import uuid
from datetime import datetime

from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum as SQLEnum, String, TypeDecorator, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:  # pragma: no cover
    from .course import Course
    from .enrollment import Enrollment


class UserRole(str, Enum):  # type: ignore[misc]
    """Supported user roles."""

    STUDENT = "student"
    INSTRUCTOR = "instructor"
    ADMIN = "admin"


class EnumValueType(TypeDecorator):
    """Convert enum to its value (lowercase string) for database storage."""
    
    impl = String
    cache_ok = True
    
    def __init__(self, enum_class, *args, **kwargs):
        self.enum_class = enum_class
        self.enum_name = kwargs.pop('name', None) or f"{enum_class.__name__.lower()}"
        super().__init__(*args, **kwargs)
    
    def load_dialect_impl(self, dialect):
        # For PostgreSQL, use the actual ENUM type to match the database column
        if dialect.name == 'postgresql':
            from sqlalchemy.dialects.postgresql import ENUM
            # Get enum values as strings - these must match the database enum values (UPPERCASE)
            enum_values = ["STUDENT", "INSTRUCTOR", "ADMIN"]  # Database uses uppercase
            return dialect.type_descriptor(ENUM(*enum_values, name=self.enum_name, create_type=False))
        # For other databases, use String
        return dialect.type_descriptor(String())
    
    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        # Convert enum to its value - database enum uses UPPERCASE
        if isinstance(value, Enum):
            # Convert to uppercase to match database enum values
            return value.value.upper()
        elif isinstance(value, str):
            # Ensure uppercase to match database enum
            return value.upper()
        else:
            return str(value).upper()
    
    
    def process_result_value(self, value, dialect):
        if value is None:
            return None
        # Convert database string back to enum
        # Database stores as UPPERCASE, but our enum uses lowercase
        if isinstance(value, str):
            # Database returns uppercase (STUDENT, INSTRUCTOR, ADMIN)
            # Convert to lowercase to match our Python enum values
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


class User(Base):
    """Persisted user record."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String(length=120))
    email: Mapped[str] = mapped_column(String(length=255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(length=255))
    role: Mapped[UserRole] = mapped_column(
        EnumValueType(UserRole, name="user_role"),
        default=UserRole.STUDENT
    )
    bio: Mapped[str | None] = mapped_column(String(length=500), nullable=True)
    phone_number: Mapped[str | None] = mapped_column(String(length=20), nullable=True)
    date_of_birth: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    owned_courses: Mapped[list["Course"]] = relationship(
        back_populates="instructor", cascade="all, delete-orphan", lazy="selectin"
    )
    enrollments: Mapped[list["Enrollment"]] = relationship(back_populates="student", lazy="selectin")

    def __repr__(self) -> str:  # pragma: no cover - repr helper
        return f"User(id={self.id}, email={self.email!r}, role={self.role})"
