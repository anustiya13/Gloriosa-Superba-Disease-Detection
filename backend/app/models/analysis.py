# ============================================================
# models/analysis.py — Analysis SQLAlchemy ORM model
# ============================================================

import json
from sqlalchemy import (
    Column, Integer, String, Boolean, Float,
    DateTime, ForeignKey, Text, func
)
from sqlalchemy.orm import relationship
from app.database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Image
    image_path = Column(String(512), nullable=False)

    # Crop Validation
    is_gloriosa = Column(Boolean, nullable=False, default=False)

    # Disease Prediction
    disease_detected = Column(Boolean, nullable=False, default=False)
    disease_name = Column(String(255), nullable=True)
    severity = Column(String(50), nullable=True)   # Healthy | Mild | Moderate | Severe
    confidence = Column(Float, nullable=True)       # 0.0 – 1.0

    # Recommendations stored as JSON string
    recommendations_json = Column(Text, nullable=True)

    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Relationship
    user = relationship("User", backref="analyses")

    # ── Helpers ──────────────────────────────────────────────

    @property
    def recommendations(self):
        """Deserialize recommendations from JSON string."""
        if self.recommendations_json:
            try:
                return json.loads(self.recommendations_json)
            except (json.JSONDecodeError, TypeError):
                return []
        return []

    @recommendations.setter
    def recommendations(self, value):
        """Serialize recommendations to JSON string for storage."""
        if isinstance(value, list):
            self.recommendations_json = json.dumps(value)
        else:
            self.recommendations_json = None

    def __repr__(self):
        return f"<Analysis id={self.id} user={self.user_id} disease={self.disease_name}>"
