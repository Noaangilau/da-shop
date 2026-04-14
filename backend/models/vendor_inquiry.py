from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base


class VendorInquiry(Base):
    __tablename__ = "vendor_inquiries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    business_name = Column(String, nullable=False)
    contact_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    instagram_handle = Column(String, nullable=True)
    product_category = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
