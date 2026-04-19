from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Index, Text
from sqlalchemy.sql import func
from database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=False)
    name = Column(String, nullable=False)
    collection = Column(String)
    price = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    subcategory = Column(String)
    description = Column(Text)
    sizes = Column(Text)  # JSON array stored as text
    image_url = Column(String)
    type = Column(String, default="product")
    is_active = Column(Boolean, default=True, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)
    stock_count = Column(Integer, nullable=True)
    kaikefiu = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("ix_products_brand_id", "brand_id"),
        Index("ix_products_category", "category"),
        Index("ix_products_is_active", "is_active"),
    )
