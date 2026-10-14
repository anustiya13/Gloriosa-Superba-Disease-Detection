# ============================================================
# services/image_service.py — Image upload validation & storage
# ============================================================

import os
import uuid
from pathlib import Path
from typing import Tuple

from fastapi import UploadFile, HTTPException
from PIL import Image, UnidentifiedImageError
import aiofiles

from app.config import settings


ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}


async def validate_and_save_image(
    file: UploadFile,
    user_id: int,
) -> str:
    """
    Validates the uploaded image file and saves it to disk.

    Checks:
    - File extension is allowed
    - MIME type is an image
    - File size is within limit
    - File is a readable image (using Pillow)

    Returns:
        Relative path of saved file: e.g. "uploads/user_1/analysis_abc123.jpg"

    Raises:
        HTTPException 400 on any validation failure.
    """
    # ── 1. Extension check ───────────────────────────────────
    original_filename = file.filename or "upload.jpg"
    ext = Path(original_filename).suffix.lstrip(".").lower()
    if ext not in settings.allowed_extensions_set:
        raise HTTPException(
            status_code=400,
            detail=f"File type '.{ext}' is not allowed. Use: {', '.join(settings.allowed_extensions_set)}"
        )

    # ── 2. Read file content ─────────────────────────────────
    content = await file.read()

    # ── 3. Size check ────────────────────────────────────────
    if len(content) > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE_MB} MB."
        )
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file.")

    # ── 4. Verify it's a real image (Pillow) ─────────────────
    import io
    try:
        img = Image.open(io.BytesIO(content))
        img.verify()  # Detect corrupt/truncated files
    except (UnidentifiedImageError, Exception):
        raise HTTPException(
            status_code=400,
            detail="Cannot read the uploaded file as an image. Please upload a valid JPG, PNG, or WEBP."
        )

    # ── 5. Save to disk ──────────────────────────────────────
    user_dir = Path(settings.UPLOAD_DIR) / f"user_{user_id}"
    user_dir.mkdir(parents=True, exist_ok=True)

    # Use random UUID filename to prevent path traversal / overwrites
    safe_filename = f"{uuid.uuid4().hex}.{ext}"
    save_path = user_dir / safe_filename

    async with aiofiles.open(save_path, "wb") as f:
        await f.write(content)

    # Return relative path for storage in DB
    relative_path = str(Path(settings.UPLOAD_DIR) / f"user_{user_id}" / safe_filename)
    return relative_path.replace("\\", "/")  # normalize for cross-platform


def get_image_full_path(relative_path: str) -> Path:
    """Resolve a stored relative image path to an absolute path."""
    return Path(relative_path).resolve()
