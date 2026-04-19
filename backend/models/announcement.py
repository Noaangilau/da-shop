from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from database import Base


class Announcement(Base):
    __tablename__ = "announcements"

    id           = Column(Integer, primary_key=True, index=True)
    title        = Column(String, nullable=False)
    body         = Column(Text, nullable=True)
    cta_label    = Column(String, nullable=True)
    cta_url      = Column(String, nullable=True)
    display_mode = Column(String, default="banner")  # banner | popup | both
    is_active    = Column(Boolean, default=True)
    starts_at    = Column(DateTime(timezone=True), nullable=True)
    ends_at      = Column(DateTime(timezone=True), nullable=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
