from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from services.media import MEDIA_DIR

router = APIRouter(tags=["media"])


@router.get("/media/{filename}")
def serve_media(filename: str):
    if "/" in filename or ".." in filename:
        raise HTTPException(400, "Invalid filename")
    path = MEDIA_DIR / filename
    if not path.is_file():
        raise HTTPException(404, "Not found")
    return FileResponse(path)
