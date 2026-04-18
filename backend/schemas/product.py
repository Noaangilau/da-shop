from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime
import json


class ProductOut(BaseModel):
    id: int
    brand_id: int
    name: str
    collection: Optional[str] = None
    price: float
    category: str
    subcategory: Optional[str] = None
    description: Optional[str] = None
    sizes: Optional[List[str]] = None
    image_url: Optional[str] = None
    type: Optional[str] = "product"
    is_active: bool
    kaikefiu: bool
    created_at: datetime

    @field_validator("sizes", mode="before")
    @classmethod
    def parse_sizes(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return []
        return v

    model_config = {"from_attributes": True}
