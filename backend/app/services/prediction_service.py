# services/prediction_service.py
# Orchestrates: crop validation → disease prediction → severity → recommendations
# Saves result to MySQL and returns the AnalysisResponse.

from sqlalchemy.orm import Session
from app.models.analysis import Analysis
from app.ai import model_service
from app.schemas.analysis import AnalysisResponse, InvalidCropResponse


def run_full_analysis(image_path: str, user_id: int, db: Session) -> dict:
    """
    Full analysis pipeline:
    1. Validate Gloriosa superba
    2. Predict disease
    3. Predict severity
    4. Generate recommendations
    5. Save to DB
    6. Return result dict

    Returns a dict that can be used to build either
    AnalysisResponse or InvalidCropResponse.
    """

    # ── Step 1: Crop Validation ──────────────────────────────
    validation = model_service.validate_gloriosa(image_path)
    is_gloriosa = validation["is_gloriosa"]

    if not is_gloriosa:
        # Save validation-only record (no disease data)
        analysis = Analysis(
            user_id=user_id,
            image_path=image_path,
            is_gloriosa=False,
            disease_detected=False,
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        return {
            "is_gloriosa": False,
            "message": "The uploaded image does not appear to be Gloriosa superba.",
        }

    # ── Step 2: Disease Prediction ───────────────────────────
    disease_result = model_service.predict_disease(image_path)
    disease_detected = disease_result["disease_detected"]
    disease_name = disease_result.get("disease_name")
    confidence = disease_result["confidence"]

    # ── Step 3: Severity ─────────────────────────────────────
    if disease_detected:
        severity = model_service.predict_severity(image_path, disease_name)
    else:
        severity = "Healthy"

    # ── Step 4: Recommendations ──────────────────────────────
    recommendations = model_service.get_recommendations(disease_name, severity)

    # ── Step 5: Save to Database ─────────────────────────────
    analysis = Analysis(
        user_id=user_id,
        image_path=image_path,
        is_gloriosa=True,
        disease_detected=disease_detected,
        disease_name=disease_name,
        severity=severity,
        confidence=confidence,
    )
    analysis.recommendations = recommendations  # Uses property setter → JSON

    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return {
        "analysis_id": analysis.id,
        "is_gloriosa": True,
        "disease_detected": disease_detected,
        "disease": disease_name,
        "severity": severity,
        "confidence": confidence,
        "recommendations": recommendations,
        "created_at": analysis.created_at,
    }
