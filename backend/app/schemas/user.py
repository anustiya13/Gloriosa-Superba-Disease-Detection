# ============================================================
# schemas/user.py — Pydantic schemas for User endpoints
# ============================================================

from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
import re


class SendOTPRequest(BaseModel):
    phone_number: str

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        # Strip spaces
        v = v.strip().replace(" ", "")
        # Accept Indian mobile: 10 digits or +91 prefix
        if not re.match(r"^(\+91)?[6-9]\d{9}$", v):
            raise ValueError("Invalid Indian phone number. Use 10 digits starting with 6–9.")
        # Normalize to 10 digits
        if v.startswith("+91"):
            v = v[3:]
        return v


class DirectLoginRequest(BaseModel):
    phone_number: str

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip().replace(" ", "")
        if not re.match(r"^(\+91)?[6-9]\d{9}$", v):
            raise ValueError("Invalid Indian phone number. Use 10 digits starting with 6–9.")
        if v.startswith("+91"):
            v = v[3:]
        return v


class VerifyOTPRequest(BaseModel):
    phone_number: str
    otp: str

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip().replace(" ", "")
        if not re.match(r"^(\+91)?[6-9]\d{9}$", v):
            raise ValueError("Invalid phone number.")
        if v.startswith("+91"):
            v = v[3:]
        return v

    @field_validator("otp")
    @classmethod
    def validate_otp(cls, v: str) -> str:
        v = v.strip()
        if not re.match(r"^\d{6}$", v):
            raise ValueError("OTP must be exactly 6 digits.")
        return v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    phone_number: str
    language: str
    is_new_user: bool


class UserProfile(BaseModel):
    id: int
    phone_number: str
    language: str
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class UpdateLanguageRequest(BaseModel):
    language: str

    @field_validator("language")
    @classmethod
    def validate_language(cls, v: str) -> str:
        if v not in ("en", "ta"):
            raise ValueError("Language must be 'en' or 'ta'.")
        return v
