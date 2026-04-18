from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from sqlalchemy.sql import func
from database import Base


class ChatLog(Base):
    __tablename__ = "chat_logs"

    id          = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(Integer, nullable=True)   # null for anonymous
    session_id  = Column(String, nullable=True)    # client-generated UUID
    role        = Column(String, nullable=False)   # "user" | "assistant"
    message     = Column(Text, nullable=False)
    tokens_used = Column(Integer, nullable=True)
    model       = Column(String, nullable=True)
    hallucination_flag = Column(String, nullable=True)  # JSON list of flagged prices
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
