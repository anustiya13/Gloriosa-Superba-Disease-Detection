# ============================================================
# schemas/analysis.py — Pydantic schemas for Analysis endpoints
# ============================================================

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class AnalysisResponse(BaseModel):
    """Full analysis result returned to frontend."""
    analysis_id: int
    is_gloriosa: bool
    disease_detected: bool
    disease: Optional[str] = None
    severity: Optional[str] = None          # Healthy | Mild | Moderate | Severe
    confidence: Optional[float] = None      # 0.0 – 1.0
    recommendations: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True


class InvalidCropResponse(BaseModel):
    """Response when uploaded image is not Gloriosa superba."""
    is_gloriosa: bool = False
    message: str = "The uploaded image does not appear to be Gloriosa superba."


class HistoryItem(BaseModel):
    """Lightweight summary for history list."""
    analysis_id: int
    disease: Optional[str] = None
    severity: Optional[str] = None
    confidence: Optional[float] = None
    created_at: datetime
    is_gloriosa: bool
    disease_detected: bool

    class Config:
        from_attributes = True


class HistoryDetail(BaseModel):
    """Full detail for individual analysis view."""
    analysis_id: int
    is_gloriosa: bool
    disease_detected: bool
    disease: Optional[str] = None
    severity: Optional[str] = None
    confidence: Optional[float] = None
    recommendations: List[str] = []
    image_path: str
    created_at: datetime

    class Config:
        from_attributes = True


class StatisticsOverview(BaseModel):
    """Aggregate system statistics — no personal data."""
    total_users: int
    total_analyses: int
    valid_gloriosa_count: int
    invalid_crop_count: int
    healthy_count: int
    disease_detected_count: int
    mild_count: int
    moderate_count: int
    severe_count: int


class DailyStats(BaseModel):
    date: str
    analysis_count: int
