from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from database import Base


class TeeTemplate(Base):
    """Blank-tee reference photo used by the Mockup Studio.

    anchor_json optionally overrides the default placement rect per
    template (e.g., hoodies need a larger, lower anchor than tees).
    """
    __tablename__ = "tee_templates"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    color = Column(String)
    image_url = Column(String, nullable=False)
    anchor_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
