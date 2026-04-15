from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from database import Base


class Customer(Base):
    __tablename__ = "customers"

    id              = Column(Integer, primary_key=True, index=True)
    email           = Column(String, unique=True, index=True, nullable=False)
    password_hash   = Column(String, nullable=False)
    first_name      = Column(String, nullable=False)
    last_name       = Column(String, nullable=False)
    phone           = Column(String, nullable=True)
    email_opt_in    = Column(Boolean, default=False)
    sms_opt_in      = Column(Boolean, default=False)
    is_admin        = Column(Boolean, default=False)
    cart_data       = Column(Text, nullable=True)           # JSON string
    cart_updated_at = Column(DateTime(timezone=True), nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
