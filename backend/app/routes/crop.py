# routes/crop.py — Crop validation-only endpoint (optional standalone use)
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.services.auth_service import get_current_user
from app.services.image_service import validate_and_save_image
from app.ai.model_service import validate_gloriosa

router = APIRouter(prefix="/api/crop", tags=["Crop Validation"])


@router.post("/validate", summary="Validate if image is Gloriosa superba (without full analysis)")
async def validate_crop(
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Quick crop validation — does not run disease detection.
    Useful for giving the farmer early feedback before full analysis.
    """
    image_path = await validate_and_save_image(image, current_user.id)
    result = validate_gloriosa(image_path)
    return {
        "is_gloriosa": result["is_gloriosa"],
        "confidence": result["confidence"],
    }
