"""Authentication API routes."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_user_from_token
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.session import get_session
from app.models import User, UserRole
from app.schemas import AuthResponse, Token, UserCreate, UserRead


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    payload: UserCreate, session: AsyncSession = Depends(get_session)
) -> AuthResponse:
    """Register a new user account."""

    result = await session.execute(select(User).where(User.email == payload.email))
    if result.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    from datetime import datetime
    
    date_of_birth = None
    if payload.date_of_birth:
        try:
            # Try ISO format first (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)
            date_of_birth = datetime.fromisoformat(payload.date_of_birth.replace('Z', '+00:00'))
        except (ValueError, TypeError, AttributeError):
            try:
                # Try simple date format YYYY-MM-DD
                date_of_birth = datetime.strptime(payload.date_of_birth, '%Y-%m-%d')
            except (ValueError, TypeError):
                pass
    
    # Use the enum directly - EnumValueType will handle conversion
    user_role = payload.role if isinstance(payload.role, UserRole) else UserRole(payload.role)
    
    user = User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        role=user_role,  # Pass enum directly
        bio=payload.bio,
        phone_number=payload.phone_number,
        date_of_birth=date_of_birth,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)

    token = create_access_token(str(user.id))
    return AuthResponse(token=Token(access_token=token), user=UserRead.model_validate(user))


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), session: AsyncSession = Depends(get_session)
) -> Token:
    """Authenticate user and issue JWT."""

    result = await session.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    token = create_access_token(str(user.id))
    return Token(access_token=token)


@router.get("/me", response_model=UserRead)
async def get_profile(current_user: User = Depends(get_user_from_token)) -> UserRead:
    """Return the current authenticated user profile."""

    return UserRead.model_validate(current_user)


@router.post("/logout")
async def logout() -> dict[str, str]:
    """Placeholder logout endpoint for client-driven auth."""

    return {"message": "Logout successful"}
