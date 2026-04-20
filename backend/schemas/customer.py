from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CustomerRegister(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    email_opt_in: bool = False
    sms_opt_in: bool = False


class CustomerLogin(BaseModel):
    email: str
    password: str


class CustomerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    email_opt_in: Optional[bool] = None
    sms_opt_in: Optional[bool] = None


class CustomerResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    phone: Optional[str]
    email_opt_in: bool
    sms_opt_in: bool
    is_admin: bool
    role: Optional[str] = None
    brand_id: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    token: str
    customer: CustomerResponse


class CartSave(BaseModel):
    cart_data: str  # JSON string
