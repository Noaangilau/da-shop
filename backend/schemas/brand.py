from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class BrandOut(BaseModel):
    id: int
    name: str
    tagline: Optional[str] = None
    bio: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    instagram: Optional[str] = None
    logo_white_url: Optional[str] = None
    logo_navy_url: Optional[str] = None
    hero_image_url: Optional[str] = None
    card_image_url: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
