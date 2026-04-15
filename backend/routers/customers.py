from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List

from database import get_db
from models.customer import Customer
from models.order import Order
from schemas.customer import CustomerUpdate, CustomerResponse, CartSave
from schemas.order import OrderResponse
from routers.auth import get_current_customer

router = APIRouter(prefix="/customers", tags=["customers"])


@router.put("/me", response_model=CustomerResponse)
def update_profile(
    data: CustomerUpdate,
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(customer, field, value)
    db.commit()
    db.refresh(customer)
    return customer


@router.put("/me/cart")
def save_cart(
    data: CartSave,
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    customer.cart_data = data.cart_data
    customer.cart_updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"success": True}


@router.delete("/me/cart")
def clear_saved_cart(
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    customer.cart_data = None
    customer.cart_updated_at = None
    db.commit()
    return {"success": True}


@router.get("/me/orders", response_model=List[OrderResponse])
def get_my_orders(
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    return (
        db.query(Order)
        .filter(Order.customer_id == customer.id)
        .order_by(Order.created_at.desc())
        .all()
    )
