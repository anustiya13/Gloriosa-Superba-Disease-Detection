# ============================================================
# routes/history.py — User analysis history endpoints
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.analysis import Analysis
from app.schemas.analysis import HistoryItem, HistoryDetail
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/history", tags=["History"])


@router.get(
    "",
    response_model=List[HistoryItem],
    summary="Get current user's analysis history",
)
def get_history(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return the authenticated user's analyses, newest first.
    Supports pagination via limit and offset.
    """
    analyses = (
        db.query(Analysis)
        .filter(Analysis.user_id == current_user.id)
        .order_by(Analysis.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return [
        HistoryItem(
            analysis_id=a.id,
            disease=a.disease_name,
            severity=a.severity,
            confidence=a.confidence,
            created_at=a.created_at,
            is_gloriosa=a.is_gloriosa,
            disease_detected=a.disease_detected,
        )
        for a in analyses
    ]


@router.get(
    "/{analysis_id}",
    response_model=HistoryDetail,
    summary="Get a specific analysis by ID",
)
def get_analysis_detail(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return full details for a specific analysis.

    SECURITY: Verifies the analysis belongs to the current user.
    A user cannot access another user's analysis by changing the ID.
    """
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    # ── OWNERSHIP CHECK ──────────────────────────────────────
    # This is critical: do NOT remove this check.
    if analysis.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Access denied. This analysis does not belong to you."
        )

    return HistoryDetail(
        analysis_id=analysis.id,
        is_gloriosa=analysis.is_gloriosa,
        disease_detected=analysis.disease_detected,
        disease=analysis.disease_name,
        severity=analysis.severity,
        confidence=analysis.confidence,
        recommendations=analysis.recommendations,
        image_path=analysis.image_path,
        created_at=analysis.created_at,
    )
