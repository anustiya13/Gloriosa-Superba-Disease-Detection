# ============================================================
# services/auth_service.py — Authentication & JWT utilities
#
# Mock OTP mode: MOCK_OTP=true → always accepts "123456"
# Production: Replace with real SMS provider (Twilio, MSG91, etc.)
# ============================================================

import time
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User

# ── In-memory OTP store ──────────────────────────────────────
# { phone_number: { "otp": "123456", "expires_at": <timestamp> } }
# WARNING: This is cleared on server restart.
# For production: replace with Redis or a proper cache.
_otp_store: dict = {}

OTP_EXPIRY_SECONDS = 300  # 5 minutes
MOCK_OTP_CODE = "123456"

# ── HTTP Bearer scheme ───────────────────────────────────────
bearer_scheme = HTTPBearer()


# ── OTP Functions ────────────────────────────────────────────

def generate_and_store_otp(phone_number: str) -> str:
    """
    Generate OTP for a phone number and store it temporarily.

    MOCK MODE: Always returns MOCK_OTP_CODE ("123456").
    PRODUCTION: Generate a real random 6-digit OTP and send via SMS provider.

    TODO (production):
        import random
        otp = str(random.randint(100000, 999999))
        send_sms(phone_number, f"Your Gloriosa AI OTP is {otp}")
    """
    if settings.MOCK_OTP:
        otp = MOCK_OTP_CODE
    else:
        import random
        otp = str(random.randint(100000, 999999))
        # TODO: Connect SMS provider here
        # send_sms_via_provider(phone_number, otp)

    _otp_store[phone_number] = {
        "otp": otp,
        "expires_at": time.time() + OTP_EXPIRY_SECONDS,
    }
    return otp


def verify_otp(phone_number: str, otp: str) -> bool:
    """
    Verify OTP for the given phone number.
    Deletes the OTP after successful verification (one-time use).
    """
    record = _otp_store.get(phone_number)
    if not record:
        return False
    if time.time() > record["expires_at"]:
        _otp_store.pop(phone_number, None)
        return False
    if record["otp"] != otp:
        return False
    # Consume OTP — one-time use
    _otp_store.pop(phone_number, None)
    return True


# ── JWT Functions ────────────────────────────────────────────

def create_access_token(user_id: int, phone_number: str) -> str:
    """Create a signed JWT access token."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "phone": phone_number,
        "exp": expire,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token. Raises HTTPException on failure."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ── FastAPI Dependency ───────────────────────────────────────

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency that extracts and validates the JWT from the
    Authorization header, then returns the current User from the DB.

    Use this in any protected route:
        current_user: User = Depends(get_current_user)
    """
    payload = decode_token(credentials.credentials)
    user_id_str = payload.get("sub")

    if not user_id_str:
        raise HTTPException(status_code=401, detail="Invalid token payload.")

    user = db.query(User).filter(User.id == int(user_id_str), User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found or deactivated.")

    return user


# ── User CRUD helpers ────────────────────────────────────────

def get_or_create_user(db: Session, phone_number: str) -> tuple[User, bool]:
    """
    Find user by phone number or create a new one.
    Returns (user, is_new_user).
    """
    user = db.query(User).filter(User.phone_number == phone_number).first()
    is_new = False

    if not user:
        user = User(phone_number=phone_number, language="ta")
        db.add(user)
        db.commit()
        db.refresh(user)
        is_new = True
    else:
        # Update last_login
        user.last_login = datetime.now(timezone.utc)
        db.commit()
        db.refresh(user)

    return user, is_new
