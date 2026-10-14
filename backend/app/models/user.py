# ============================================================
# models/user.py — User SQLAlchemy ORM model
# ============================================================

from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    phone_number = Column(String(20), unique=True, nullable=False, index=True)
    language = Column(String(5), nullable=False, default="ta")   # "ta" or "en"
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<User id={self.id} phone={self.phone_number}>"
