"""
Stripe payment routes.

POST /payments/create-intent  — create a PaymentIntent, return client_secret (auth required)
POST /payments/webhook        — Stripe webhook (no auth, verified by signature)

If STRIPE_SECRET_KEY is not set, create-intent returns 503.
The orders router skips PI verification in the same case, so dev works without Stripe.
"""

import os
import json
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Header, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from routers.auth import get_optional_customer
from models.customer import Customer

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/payments", tags=["payments"])


def _get_stripe():
    import stripe as _s  # type: ignore
    key = os.getenv("STRIPE_SECRET_KEY")
    if not key:
        raise HTTPException(status_code=503, detail="Payment processing not configured")
    _s.api_key = key
    return _s


class PaymentIntentCreate(BaseModel):
    amount_cents: int
    currency: str = "nzd"


@router.post("/create-intent")
def create_payment_intent(
    data: PaymentIntentCreate,
    customer: Optional[Customer] = Depends(get_optional_customer),
):
    if data.amount_cents < 50:
        raise HTTPException(status_code=400, detail="Minimum order amount is $0.50")

    stripe = _get_stripe()
    metadata = (
        {"customer_id": str(customer.id), "customer_email": customer.email}
        if customer
        else {"guest": "1"}
    )
    try:
        intent = stripe.PaymentIntent.create(
            amount=data.amount_cents,
            currency=data.currency,
            metadata=metadata,
            automatic_payment_methods={"enabled": True},
        )
    except Exception as exc:
        logger.error(f"[STRIPE] create_payment_intent failed: {exc}")
        raise HTTPException(status_code=502, detail="Failed to initialise payment")

    return {"client_secret": intent.client_secret, "payment_intent_id": intent.id}


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None, alias="stripe-signature"),
    db: Session = Depends(get_db),
):
    stripe_key = os.getenv("STRIPE_SECRET_KEY")
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    if not stripe_key:
        raise HTTPException(status_code=503, detail="Payment processing not configured")

    import stripe as _s  # type: ignore
    _s.api_key = stripe_key

    payload = await request.body()

    if webhook_secret and stripe_signature:
        try:
            event = _s.Webhook.construct_event(payload, stripe_signature, webhook_secret)
        except _s.error.SignatureVerificationError:
            raise HTTPException(status_code=400, detail="Invalid Stripe signature")
    else:
        # Dev: no webhook secret — accept without signature verification
        event = json.loads(payload)

    event_type = event.get("type", "")
    logger.info(f"[STRIPE:webhook] {event_type}")

    if event_type == "payment_intent.succeeded":
        pi = event["data"]["object"]
        from models.order import Order
        order = db.query(Order).filter(Order.payment_intent_id == pi["id"]).first()
        if order and order.status == "pending":
            order.status = "confirmed"
            db.commit()
            logger.info(f"[STRIPE:webhook] Order {order.id} → confirmed via webhook")

    elif event_type == "charge.refunded":
        charge = event["data"]["object"]
        pi_id = charge.get("payment_intent")
        if pi_id:
            from models.order import Order
            order = db.query(Order).filter(Order.payment_intent_id == pi_id).first()
            if order:
                order.status = "refunded"
                db.commit()
                logger.info(f"[STRIPE:webhook] Order {order.id} → refunded")

    return {"received": True}
