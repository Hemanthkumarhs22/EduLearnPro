"""Public statistics schemas."""

from pydantic import BaseModel


class PlatformStats(BaseModel):
    """Public platform statistics."""

    total_students: int
    total_instructors: int
    total_courses: int
    satisfaction_rate: float

