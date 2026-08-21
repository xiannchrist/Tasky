"""
Tasky Backend — Auth Schemas with Security Validation
"""

import re
from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    """Registration request body with strict password complexity."""
    name: str = Field(..., min_length=1, max_length=255, examples=["John Doe"])
    email: EmailStr = Field(..., examples=["student@example.com"])
    password: str = Field(..., min_length=6, max_length=128, examples=["securepassword123"])

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v

    @field_validator("name", mode="before")
    @classmethod
    def clean_name(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip()
        return v

    @field_validator("password")
    @classmethod
    def validate_password_complexity(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters long")
        return v


class LoginRequest(BaseModel):
    """Login request body."""
    email: EmailStr = Field(..., examples=["student@example.com"])
    password: str = Field(..., examples=["securepassword123"])

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v


class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    """Token refresh request body."""
    refresh_token: str = Field(..., min_length=1)
