from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base


class Brand(Base):
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    tagline = Column(String)
    bio = Column(String)
    category = Column(String)
    location = Column(String)
    instagram = Column(String)
    logo_white_url = Column(String)
    logo_navy_url = Column(String)
    hero_image_url = Column(String)
    card_image_url = Column(String)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
