"""Route definitions for Edu Learn Pro API."""

from fastapi import APIRouter

from . import auth, courses, enrollments, lessons, stats, users


api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(courses.router)
api_router.include_router(lessons.router)
api_router.include_router(enrollments.router)
api_router.include_router(stats.router)

__all__ = ["api_router"]
