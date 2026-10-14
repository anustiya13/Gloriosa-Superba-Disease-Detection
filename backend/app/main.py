# ============================================================
# app/main.py — FastAPI application entry point
# ============================================================

import os
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.config import settings
from app.database import create_tables
from app.ai.model_service import load_models

# Import all route modules
from app.routes import auth, analysis, history, statistics, crop

# ── App Instance ─────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    **Gloriosa AI** — AI-Based Crop Disease Detection and Severity Assessment
    for Gloriosa superba farmers.

    ## Features
    - Phone number + OTP authentication
    - Gloriosa superba crop validation
    - AI disease detection and severity assessment
    - Personalized recommendations
    - Analysis history
    - Usage statistics

    ## Authentication
    Use `POST /api/auth/verify-otp` to get a Bearer token.
    Include it in all protected requests: `Authorization: Bearer <token>`

    ## Mock Mode
    Set `MOCK_AI=true` and `MOCK_OTP=true` in `.env` for development.
    OTP is always `123456` in mock mode.
    """,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Serve uploaded images as static files ─────────────────────
uploads_dir = Path(settings.UPLOAD_DIR)
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# ── Register Routes ───────────────────────────────────────────
app.include_router(auth.router)
app.include_router(analysis.router)
app.include_router(history.router)
app.include_router(statistics.router)
app.include_router(crop.router)

# ── Startup Event ─────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    """
    Runs once when the application starts.
    1. Creates database tables (if not exists)
    2. Loads AI models into memory
    """
    print(f"[startup] {settings.APP_NAME} v{settings.APP_VERSION} starting...")
    print(f"[startup] MOCK_AI={settings.MOCK_AI}, MOCK_OTP={settings.MOCK_OTP}")
    create_tables()
    print("[startup] Database tables ready.")
    load_models()
    print("[startup] Application ready.")

# ── Global Error Handler ──────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Catch-all error handler.
    Never exposes Python stack traces to users.
    """
    import traceback
    print(f"[ERROR] Unhandled exception: {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "An internal error occurred. Please try again later."},
    )

# ── Health Check ──────────────────────────────────────────────
@app.get("/api/health", tags=["Health"])
def health_check():
    """Quick health check endpoint."""
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "mock_ai": settings.MOCK_AI,
        "mock_otp": settings.MOCK_OTP,
    }

# ── Root ──────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "docs": "/api/docs",
        "health": "/api/health",
    }
