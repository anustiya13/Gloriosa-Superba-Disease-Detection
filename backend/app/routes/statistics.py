# ============================================================
# routes/statistics.py — Aggregate usage statistics
# Returns ONLY aggregate counts — no personal data.
# ============================================================

from fastapi import APIRouter, Depends
from sqlalchemy import func, case
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from app.database import get_db
from app.models.user import User
from app.models.analysis import Analysis
from app.schemas.analysis import StatisticsOverview, DailyStats
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/statistics", tags=["Statistics"])


@router.get(
    "/overview",
    response_model=StatisticsOverview,
    summary="Get system-wide aggregate statistics",
    description="Returns aggregate counts only. No personal data is included.",
)
def get_statistics_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Aggregate usage statistics for the system dashboard.

    Note: In a production system, only admins should access this.
    TODO: Add admin role check when admin auth is implemented.
    """
    total_users = db.query(func.count(User.id)).scalar() or 0

    analyses = db.query(Analysis).filter(Analysis.is_gloriosa == True).all()
    total_analyses = len(analyses)
    valid_gloriosa = total_analyses
    invalid_count = db.query(func.count(Analysis.id)).filter(Analysis.is_gloriosa == False).scalar() or 0

    healthy_count     = sum(1 for a in analyses if a.severity == "Healthy")
    disease_count     = sum(1 for a in analyses if a.disease_detected)
    mild_count        = sum(1 for a in analyses if a.severity == "Mild")
    moderate_count    = sum(1 for a in analyses if a.severity == "Moderate")
    severe_count      = sum(1 for a in analyses if a.severity == "Severe")

    return StatisticsOverview(
        total_users=total_users,
        total_analyses=valid_gloriosa + invalid_count,
        valid_gloriosa_count=valid_gloriosa,
        invalid_crop_count=invalid_count,
        healthy_count=healthy_count,
        disease_detected_count=disease_count,
        mild_count=mild_count,
        moderate_count=moderate_count,
        severe_count=severe_count,
    )


@router.get(
    "/daily",
    response_model=List[DailyStats],
    summary="Get daily analysis counts for the past N days",
)
def get_daily_stats(
    days: int = 7,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return per-day analysis counts for the last N days (max 90)."""
    days = min(days, 90)  # cap
    since = datetime.utcnow() - timedelta(days=days)

    from sqlalchemy import cast, Date as SQLDate
    rows = (
        db.query(
            cast(Analysis.created_at, SQLDate).label("date"),
            func.count(Analysis.id).label("count"),
        )
        .filter(Analysis.created_at >= since)
        .group_by(cast(Analysis.created_at, SQLDate))
        .order_by(cast(Analysis.created_at, SQLDate))
        .all()
    )

    return [DailyStats(date=str(r.date), analysis_count=r.count) for r in rows]
