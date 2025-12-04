"""Common Pydantic schema primitives."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ORMModel(BaseModel):
    """Base model with ORM mode enabled."""

    class Config:
        from_attributes = True


class IDMixin(BaseModel):
    """Expose UUID identifiers."""

    id: UUID


class TimestampMixin(BaseModel):
    """Expose created/updated timestamps."""

    created_at: datetime
    updated_at: datetime | None = None
