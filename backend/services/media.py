"""Shared file-storage helpers for admin + vendor uploads.

Writes to MEDIA_DIR (Railway persistent volume in prod, ./media locally).
URLs returned are rooted at /media/{filename} and served by
routers/media.py via FileResponse.
"""
import os
import uuid
from pathlib import Path
from fastapi import HTTPException, UploadFile

MEDIA_DIR = Path(os.getenv("MEDIA_DIR", "./media"))
MEDIA_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_MIME = {"image/png", "image/jpeg", "image/webp"}
EXT_BY_MIME = {"image/png": "png", "image/jpeg": "jpg", "image/webp": "webp"}
MAX_BYTES = 5 * 1024 * 1024  # 5 MB


async def save_upload(upload: UploadFile, prefix: str) -> str:
    """Validate + persist an uploaded image, return public /media/... URL path."""
    if upload.content_type not in ALLOWED_MIME:
        raise HTTPException(400, f"Unsupported type {upload.content_type}; use PNG, JPEG, or WebP")
    data = await upload.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(400, f"File too large ({len(data)} bytes; max {MAX_BYTES})")
    if not data:
        raise HTTPException(400, "Empty file")
    ext = EXT_BY_MIME[upload.content_type]
    filename = f"{prefix}-{uuid.uuid4().hex}.{ext}"
    (MEDIA_DIR / filename).write_bytes(data)
    return f"/media/{filename}"


def save_bytes(data: bytes, prefix: str, ext: str = "png") -> str:
    """Persist raw bytes (e.g. from mockup compositor) and return /media path."""
    filename = f"{prefix}-{uuid.uuid4().hex}.{ext}"
    (MEDIA_DIR / filename).write_bytes(data)
    return f"/media/{filename}"
