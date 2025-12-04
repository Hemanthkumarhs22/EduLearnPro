"""Pydantic schemas for Edu Learn Pro."""

from .course import CourseBase, CourseCreate, CourseDetail, CourseRead, CourseSummary, CourseUpdate
from .dashboard import CourseAnalytics, InstructorDashboard, ProgressOverview, StudentDashboard
from .enrollment import CertificateRead, EnrollmentCreate, EnrollmentDetail, EnrollmentRead, LessonProgressRead, ProgressUpdate
from .lesson import LessonBase, LessonCreate, LessonRead, LessonUpdate
from .stats import PlatformStats
from .user import AuthResponse, ProfileRead, ProfileUpdate, Token, TokenData, UserBase, UserCreate, UserRead, UserUpdate

__all__ = [
    "CourseBase",
    "CourseCreate",
    "CourseDetail",
    "CourseRead",
    "CourseSummary",
    "CourseUpdate",
    "CourseAnalytics",
    "InstructorDashboard",
    "ProgressOverview",
    "StudentDashboard",
    "CertificateRead",
    "EnrollmentCreate",
    "EnrollmentDetail",
    "EnrollmentRead",
    "LessonProgressRead",
    "ProgressUpdate",
    "LessonBase",
    "LessonCreate",
    "LessonRead",
    "LessonUpdate",
    "PlatformStats",
    "AuthResponse",
    "ProfileRead",
    "ProfileUpdate",
    "Token",
    "TokenData",
    "UserBase",
    "UserCreate",
    "UserRead",
    "UserUpdate",
]
