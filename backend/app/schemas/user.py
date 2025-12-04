"""User related Pydantic schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_serializer

from app.models import UserRole
from app.schemas.base import ORMModel


class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    role: UserRole = UserRole.STUDENT
    bio: str | None = Field(default=None, max_length=500)
    phone_number: str | None = Field(default=None, max_length=20)
    date_of_birth: str | None = None  # ISO format date string for input


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    bio: str | None = Field(default=None, max_length=500)
    phone_number: str | None = Field(default=None, max_length=20)
    date_of_birth: str | None = None  # ISO format date string for input


class UserRead(ORMModel):
    id: UUID
    full_name: str
    email: str
    role: UserRole
    bio: str | None = None
    phone_number: str | None = None
    date_of_birth: datetime | None = None  # datetime from model
    
    @field_serializer('date_of_birth')
    def serialize_date_of_birth(self, value: datetime | None) -> str | None:
        """Serialize datetime to ISO format string."""
        if value is None:
            return None
        return value.isoformat()


class ProfileRead(UserRead):
    pass


class ProfileUpdate(UserUpdate):
    pass


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: UUID | None = None


class AuthResponse(BaseModel):
    token: Token
    user: UserRead
