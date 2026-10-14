# ============================================================
# routes/analysis.py — Image upload & AI analysis endpoints
# ============================================================

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services.auth_service import get_current_user
from app.services.image_service import validate_and_save_image
from app.services.prediction_service import run_full_analysis

router = APIRouter(prefix="/api/analysis", tags=["Analysis"])


@router.post(
    "/predict",
    summary="Upload a crop image and get AI disease prediction",
    description="""
    Upload a Gloriosa superba plant image for disease detection.

    Pipeline:
    1. Validate file (type, size, readability)
    2. Save image to disk
    3. Validate it's a Gloriosa superba plant
    4. Run disease classification
    5. Run severity assessment
    6. Return recommendations
    7. Save analysis to database
    """,
)
async def predict(
    image: UploadFile = File(..., description="JPG, JPEG, PNG, or WEBP image of the plant"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Full analysis endpoint.
    Returns either AnalysisResponse (valid crop) or InvalidCropResponse.
    """
    # Validate and save the image
    image_path = await validate_and_save_image(image, current_user.id)

    # Run the full AI pipeline
    result = run_full_analysis(image_path, current_user.id, db)

    return result
