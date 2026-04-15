from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone, timedelta
import json

from database import get_db
from models.customer import Customer
from models.order import Order
from models.vendor_inquiry import VendorInquiry
from routers.auth import get_admin_customer
from utils.email import send_cart_abandonment_email, send_cart_abandonment_sms

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
def get_stats(
    admin: Customer = Depends(get_admin_customer),
    db: Session = Depends(get_db),
):
    total_orders   = db.query(func.count(Order.id)).scalar() or 0
    total_revenue  = db.query(func.sum(Order.total)).scalar() or 0
    total_customers = db.query(func.count(Customer.id)).scalar() or 0
    total_inquiries = db.query(func.count(VendorInquiry.id)).scalar() or 0

    return {
        "total_orders":    total_orders,
        "total_revenue":   round(float(total_revenue), 2),
        "total_customers": total_customers,
        "total_inquiries": total_inquiries,
    }


@router.get("/orders")
def get_all_orders(
    admin: Customer = Depends(get_admin_customer),
    db: Session = Depends(get_db),
):
    orders = db.query(Order).order_by(Order.created_at.desc()).limit(200).all()
    return [
        {
            "id":            o.id,
            "customer_id":   o.customer_id,
            "status":        o.status,
            "total":         o.total,
            "email":         o.email,
            "shipping_name": o.shipping_name,
            "shipping_city": o.shipping_city,
            "created_at":    o.created_at.isoformat() if o.created_at else None,
            "items": [
                {
                    "product_name": i.product_name,
                    "brand":        i.brand,
                    "price":        i.price,
                    "quantity":     i.quantity,
                }
                for i in o.items
            ],
        }
        for o in orders
    ]


@router.get("/customers")
def get_all_customers(
    admin: Customer = Depends(get_admin_customer),
    db: Session = Depends(get_db),
):
    customers = db.query(Customer).order_by(Customer.created_at.desc()).limit(200).all()
    return [
        {
            "id":          c.id,
            "email":       c.email,
            "first_name":  c.first_name,
            "last_name":   c.last_name,
            "email_opt_in": c.email_opt_in,
            "sms_opt_in":  c.sms_opt_in,
            "created_at":  c.created_at.isoformat() if c.created_at else None,
        }
        for c in customers
    ]


@router.get("/vendor-inquiries")
def get_inquiries(
    admin: Customer = Depends(get_admin_customer),
    db: Session = Depends(get_db),
):
    return db.query(VendorInquiry).order_by(VendorInquiry.created_at.desc()).all()


@router.post("/trigger-abandonment")
def trigger_abandonment(
    admin: Customer = Depends(get_admin_customer),
    db: Session = Depends(get_db),
):
    """
    Find customers with carts abandoned >2 hours ago and send notifications.
    Only contacts customers who have opted in to email/SMS.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(hours=2)

    abandoned = (
        db.query(Customer)
        .filter(
            Customer.cart_data != None,
            Customer.cart_updated_at < cutoff,
        )
        .all()
    )

    sent = 0
    for customer in abandoned:
        try:
            cart_items = json.loads(customer.cart_data or "[]")
            if not cart_items:
                continue
            if customer.email_opt_in:
                send_cart_abandonment_email(
                    customer_email=customer.email,
                    customer_name=customer.first_name,
                    cart_items=cart_items,
                )
            if customer.sms_opt_in and customer.phone:
                send_cart_abandonment_sms(customer.phone, customer.first_name)
            sent += 1
        except Exception:
            pass

    return {"success": True, "notifications_sent": sent}
