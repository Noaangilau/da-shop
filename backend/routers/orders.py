import os
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.order import Order, OrderItem
from models.customer import Customer
from schemas.order import OrderCreate, OrderResponse
from routers.auth import get_current_customer
from utils.email import send_order_confirmation_email

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/orders", tags=["orders"])


def _verify_payment_intent(payment_intent_id: str) -> None:
    """Verify the PaymentIntent is 'succeeded' via Stripe API.
    Skipped gracefully when STRIPE_SECRET_KEY is not set (dev mode)."""
    stripe_key = os.getenv("STRIPE_SECRET_KEY")
    if not stripe_key:
        logger.warning("[ORDERS] STRIPE_SECRET_KEY not set — skipping PI verification (dev mode)")
        return

    import stripe  # type: ignore
    stripe.api_key = stripe_key
    try:
        pi = stripe.PaymentIntent.retrieve(payment_intent_id)
    except stripe.error.InvalidRequestError:
        raise HTTPException(status_code=400, detail="Invalid payment intent")
    except Exception as exc:
        logger.error(f"[ORDERS] Stripe retrieve failed: {exc}")
        raise HTTPException(status_code=502, detail="Could not verify payment")

    if pi.status != "succeeded":
        raise HTTPException(
            status_code=402,
            detail=f"Payment not completed (status: {pi.status})",
        )


@router.post("", response_model=OrderResponse)
def create_order(
    data: OrderCreate,
    customer: Customer = Depends(get_current_customer),
    db: Session = Depends(get_db),
):
    if not data.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # ── Idempotency: return existing order for this PaymentIntent ──────────────
    if data.payment_intent_id:
        existing = (
            db.query(Order)
            .filter(Order.payment_intent_id == data.payment_intent_id)
            .first()
        )
        if existing:
            logger.info(f"[ORDERS] Idempotent return for PI {data.payment_intent_id}, order {existing.id}")
            return existing

    # ── Verify payment with Stripe ─────────────────────────────────────────────
    if data.payment_intent_id:
        _verify_payment_intent(data.payment_intent_id)

    subtotal = sum(item.price * item.quantity for item in data.items)
    total = subtotal  # no tax/shipping in this version

    order = Order(
        customer_id=customer.id,
        payment_intent_id=data.payment_intent_id or None,
        status="confirmed",  # PI verified → confirmed immediately
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
            variant=item.variant,
            size=item.size,
        ))

    customer.cart_data = None
    customer.cart_updated_at = None

    db.commit()
    db.refresh(order)

    items_for_email = [
        {"product_name": i.product_name, "quantity": i.quantity, "price": i.price}
        for i in order.items
    ]
    send_order_confirmation_email(
        customer_email=data.email,
        customer_name=customer.first_name,
        order_id=order.id,
        total=total,
        items=items_for_email,
        db=db,
        customer_id=customer.id,
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
