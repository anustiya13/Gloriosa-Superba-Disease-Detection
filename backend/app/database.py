import os
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Create engine with fallback mechanism
def get_engine():
    try:
        connect_args = {}
        if settings.DATABASE_URL.startswith("sqlite"):
            connect_args["check_same_thread"] = False
        
        eng = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True if not settings.DATABASE_URL.startswith("sqlite") else False,
            connect_args=connect_args,
            echo=settings.DEBUG,
        )
        # Test connection
        with eng.connect() as conn:
            pass
        return eng
    except Exception as e:
        print(f"[WARNING] Database connection to '{settings.DATABASE_URL}' failed: {e}")
        print("[INFO] Falling back to SQLite database at './gloriosa_ai.db'...")
        return create_engine(
            "sqlite:///./gloriosa_ai.db",
            connect_args={"check_same_thread": False},
            echo=settings.DEBUG,
        )

engine = get_engine()

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all ORM models
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that yields a database session.
    Guarantees session is closed after each request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """
    Create all tables defined in models.
    Called on application startup.
    """
    Base.metadata.create_all(bind=engine)
