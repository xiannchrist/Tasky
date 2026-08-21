"""
Tasky Backend — Auth Service

Registration, login, and token management.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse


async def register_user(db: AsyncSession, data: RegisterRequest) -> User:
    """
    Register a new student account.
    
    Raises ValueError if email already exists.
    """
    # Check for duplicate email
    result = await db.execute(select(User).where(User.email == data.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise ValueError("An account with this email already exists")

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        name=data.name,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def authenticate_user(db: AsyncSession, data: LoginRequest) -> User:
    """
    Authenticate a user by email and password.
    
    Raises ValueError if credentials are invalid.
    """
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(data.password, user.password_hash):
        raise ValueError("Invalid email or password")

    return user


def generate_tokens(user: User) -> TokenResponse:
    """Generate access and refresh tokens for a user."""
    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(subject=str(user.id))

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )


async def refresh_access_token(db: AsyncSession, refresh_token: str) -> TokenResponse:
    """
    Validate a refresh token and issue new tokens.
    
    Raises ValueError if the refresh token is invalid or expired.
    """
    payload = decode_token(refresh_token)
    if payload is None:
        raise ValueError("Invalid or expired refresh token")

    token_type = payload.get("type")
    user_id = payload.get("sub")

    if token_type != "refresh" or user_id is None:
        raise ValueError("Invalid token type")

    try:
        user_id_int = int(user_id)
    except (ValueError, TypeError):
        raise ValueError("Invalid token payload")

    result = await db.execute(select(User).where(User.id == user_id_int))
    user = result.scalar_one_or_none()

    if user is None:
        raise ValueError("User not found")

    return generate_tokens(user)
