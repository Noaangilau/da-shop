from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.order import Order, OrderItem
from models.customer import Customer
from schemas.order import OrderCreate, OrderResponse
from routers.auth import get_current_customer
from utils.email import send_order_confirmation_email

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderResponse)
def create_order(
    data: OrderCreate,
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    if not data.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    subtotal = sum(item.price * item.quantity for item in data.items)
    total = subtotal  # no tax/shipping in this version

    order = Order(
        customer_id=customer.id,
        subtotal=subtotal,
        total=total,
        email=data.email,
        phone=data.phone,
        shipping_name=data.shipping_name,
        shipping_address=data.shipping_address,
        shipping_city=data.shipping_city,
        shipping_postcode=data.shipping_postcode,
        shipping_country=data.shipping_country,
    )
    db.add(order)
    db.flush()

    for item in data.items:
        db.add(OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            product_name=item.product_name,
            brand=item.brand,
            price=item.price,
            quantity=item.quantity,
            image=item.image,
        ))

    # Clear saved cart on checkout
    customer.cart_data = None
    customer.cart_updated_at = None

    db.commit()
    db.refresh(order)

    send_order_confirmation_email(
        customer_email=data.email,
        customer_name=customer.first_name,
        order_id=order.id,
        total=total,
    )

    return order


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id, Order.customer_id == customer.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
