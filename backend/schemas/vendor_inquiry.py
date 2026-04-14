from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class VendorInquiryCreate(BaseModel):
    business_name: str
    contact_name: str
    email: str
    instagram_handle: Optional[str] = None
    product_category: str


class VendorInquiryResponse(BaseModel):
    id: int
    business_name: str
    contact_name: str
    email: str
    instagram_handle: Optional[str]
    product_category: str
    created_at: datetime

    class Config:
        from_attributes = True
