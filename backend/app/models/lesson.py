from __future__ import annotations

"""Lesson model definition."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:  # pragma: no cover
    from .course import Course
    from .enrollment import LessonProgress


class Lesson(Base):
    """Persisted lesson record."""

    __tablename__ = "lessons"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(length=200))
    content: Mapped[str] = mapped_column(Text)
    video_url: Mapped[str | None] = mapped_column(String(length=500), nullable=True)
    thumbnail_url: Mapped[str | None] = mapped_column(String(length=500), nullable=True)
    position: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    course: Mapped["Course"] = relationship(back_populates="lessons", lazy="joined")
    progresses: Mapped[list["LessonProgress"]] = relationship(
        back_populates="lesson", cascade="all, delete-orphan", lazy="selectin"
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"Lesson(id={self.id}, title={self.title!r}, position={self.position})"
