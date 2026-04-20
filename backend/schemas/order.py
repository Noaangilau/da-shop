from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class OrderItemCreate(BaseModel):
    product_id: int
    product_name: str
    brand: str
    price: float
    quantity: int
    image: Optional[str] = None
    variant: Optional[str] = None
    size: Optional[str] = None


class OrderCreate(BaseModel):
    payment_intent_id: Optional[str] = None   # required in prod, optional in dev (no Stripe key)
    items: List[OrderItemCreate]
    email: str
    phone: Optional[str] = None
    shipping_name: str
    shipping_address: str
    shipping_city: str
    shipping_postcode: str
    shipping_country: str


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    brand: str
    price: float
    quantity: int
    image: Optional[str]
    variant: Optional[str] = None
    size: Optional[str] = None

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    payment_intent_id: Optional[str]
    status: str
    subtotal: float
    total: float
    email: str
    phone: Optional[str]
    shipping_name: str
    shipping_address: str
    shipping_city: str
    shipping_postcode: str
    shipping_country: str
    created_at: datetime
    items: List[OrderItemResponse]

    model_config = {"from_attributes": True}
