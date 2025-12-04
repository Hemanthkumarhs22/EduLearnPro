"""Security utilities: password hashing and JWT token helpers."""
import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Any, Optional


from jose import JWTError, jwt

from app.core.config import get_settings


settings = get_settings()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return True if the password matches the hashed value."""
    try:
        # bcrypt expects bytes
        password_bytes = plain_password.encode('utf-8')
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hash_bytes)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Hash a password for storing."""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(password_bytes, salt)
    return hashed_bytes.decode('utf-8')


def create_access_token(subject: str | dict[str, Any], expires_delta: Optional[int] = None) -> str:
    """Create a signed JWT access token."""

    expire_minutes = expires_delta or settings.access_token_expire_minutes
    expire = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
    to_encode: dict[str, Any] = {"exp": expire}
    if isinstance(subject, dict):
        to_encode.update(subject)
    else:
        to_encode["sub"] = subject
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT token."""

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError as exc:  # pragma: no cover - validated via integration
        raise ValueError("Invalid token") from exc
    return payload
