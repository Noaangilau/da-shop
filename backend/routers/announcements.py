from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime, timezone

from database import get_db
from models.announcement import Announcement

router = APIRouter(prefix="/announcements", tags=["announcements"])


@router.get("/active")
def list_active(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    rows = (
        db.query(Announcement)
        .filter(Announcement.is_active == True)  # noqa: E712
        .filter(or_(Announcement.starts_at == None, Announcement.starts_at <= now))  # noqa: E711
        .filter(or_(Announcement.ends_at == None, Announcement.ends_at >= now))      # noqa: E711
        .order_by(Announcement.created_at.desc())
        .all()
    )
    return [
        {
            "id": a.id,
            "title": a.title,
            "body": a.body,
            "cta_label": a.cta_label,
            "cta_url": a.cta_url,
            "display_mode": a.display_mode,
        }
        for a in rows
    ]
