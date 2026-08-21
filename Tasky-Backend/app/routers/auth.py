"""
Tasky Backend — Auth Router

POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
GET  /api/auth/me
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_user
from app.core.rate_limiter import rate_limit_auth
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, RefreshRequest
from app.schemas.user import UserResponse
from app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new student account",
    dependencies=[Depends(rate_limit_auth)],
)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new Tasky account and return JWT tokens."""
    try:
        user = await auth_service.register_user(db, data)
        return auth_service.generate_tokens(user)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login with email and password",
    dependencies=[Depends(rate_limit_auth)],
)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate a student and return JWT tokens."""
    try:
        user = await auth_service.authenticate_user(db, data)
        return auth_service.generate_tokens(user)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh access token",
)
async def refresh(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Use a refresh token to get new access and refresh tokens."""
    try:
        return await auth_service.refresh_access_token(db, data.refresh_token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user",
)
async def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    return current_user
