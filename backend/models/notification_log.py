from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from database import Base


class NotificationLog(Base):
    __tablename__ = "notification_logs"

    id          = Column(Integer, primary_key=True, autoincrement=True)
    channel     = Column(String, nullable=False)          # "email" | "sms"
    recipient   = Column(String, nullable=False)          # email address or phone number
    template    = Column(String, nullable=False)          # "order_confirmation" | "cart_abandonment" etc.
    subject     = Column(String, nullable=True)           # email subject (null for SMS)
    status      = Column(String, nullable=False)          # "sent" | "failed" | "skipped"
    error       = Column(Text, nullable=True)             # error message on failure
    provider_id = Column(String, nullable=True)           # Resend message ID or Twilio SID
    order_id    = Column(Integer, nullable=True)
    customer_id = Column(Integer, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
