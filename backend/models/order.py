from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Order(Base):
    __tablename__ = "orders"

    id                  = Column(Integer, primary_key=True, index=True)
    customer_id         = Column(Integer, ForeignKey("customers.id"), nullable=False)
    payment_intent_id   = Column(String, unique=True, nullable=True, index=True)
    status              = Column(String, default="pending")   # pending | confirmed | shipped | delivered | refunded
    subtotal          = Column(Float, nullable=False)
    total             = Column(Float, nullable=False)
    email             = Column(String, nullable=False)
    phone             = Column(String, nullable=True)
    shipping_name     = Column(String, nullable=False)
    shipping_address  = Column(String, nullable=False)
    shipping_city     = Column(String, nullable=False)
    shipping_postcode = Column(String, nullable=False)
    shipping_country  = Column(String, nullable=False)
    created_at        = Column(DateTime(timezone=True), server_default=func.now())

    items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id           = Column(Integer, primary_key=True, index=True)
    order_id     = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id   = Column(Integer, nullable=False)
    product_name = Column(String, nullable=False)
    brand        = Column(String, nullable=False)
    price        = Column(Float, nullable=False)
    quantity     = Column(Integer, nullable=False)
    image        = Column(String, nullable=True)
    variant      = Column(String, nullable=True)
    size         = Column(String, nullable=True)

    order = relationship("Order", back_populates="items")
