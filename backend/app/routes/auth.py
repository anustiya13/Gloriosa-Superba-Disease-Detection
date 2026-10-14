# ============================================================
# routes/auth.py — Phone OTP authentication endpoints
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import (
    SendOTPRequest, DirectLoginRequest, VerifyOTPRequest, TokenResponse,
    UserProfile, UpdateLanguageRequest
)
from app.services.auth_service import (
    generate_and_store_otp,
    verify_otp,
    create_access_token,
    get_or_create_user,
    get_current_user,
)
from app.models.user import User
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login-direct", response_model=TokenResponse, summary="Direct phone login without OTP")
async def login_direct(body: DirectLoginRequest, db: Session = Depends(get_db)):
    """
    Direct login endpoint for farmers.
    Logs in or registers immediately with phone number — no OTP required.
    """
    user, is_new_user = get_or_create_user(db, body.phone_number)
    token = create_access_token(user.id, user.phone_number)

    return TokenResponse(
        access_token=token,
        user_id=user.id,
        phone_number=user.phone_number,
        language=user.language,
        is_new_user=is_new_user,
    )


@router.post("/send-otp", summary="Send OTP to phone number")
async def send_otp(body: SendOTPRequest, db: Session = Depends(get_db)):
    """
    Send a one-time password to the given phone number.

    In MOCK mode (MOCK_OTP=true): OTP is always 123456.
    In production: Sends a real SMS via the configured provider.
    """
    otp = generate_and_store_otp(body.phone_number)

    response = {"message": "OTP sent successfully.", "phone_number": body.phone_number}

    # In mock mode, include the OTP in the response for easy testing
    if settings.MOCK_OTP:
        response["mock_otp"] = otp
        response["note"] = "MOCK MODE — OTP is not sent via SMS. Use 123456."

    return response


@router.post("/verify-otp", response_model=TokenResponse, summary="Verify OTP and login")
async def verify_otp_and_login(body: VerifyOTPRequest, db: Session = Depends(get_db)):
    """
    Verify OTP and return a JWT token.
    Creates the user if they don't exist yet.
    """
    if not verify_otp(body.phone_number, body.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP.")

    user, is_new_user = get_or_create_user(db, body.phone_number)
    token = create_access_token(user.id, user.phone_number)

    return TokenResponse(
        access_token=token,
        user_id=user.id,
        phone_number=user.phone_number,
        language=user.language,
        is_new_user=is_new_user,
    )


@router.get("/me", response_model=UserProfile, summary="Get current user profile")
async def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    return current_user


@router.post("/logout", summary="Logout (client should discard token)")
async def logout(current_user: User = Depends(get_current_user)):
    """
    Logout endpoint. JWT tokens are stateless — the client should
    simply discard the token. For production, implement a token
    denylist if immediate invalidation is required.
    """
    return {"message": "Logged out successfully."}


@router.patch("/language", response_model=UserProfile, summary="Update preferred language")
async def update_language(
    body: UpdateLanguageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the user's preferred language (ta or en)."""
    current_user.language = body.language
    db.commit()
    db.refresh(current_user)
    return current_user
