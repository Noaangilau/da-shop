from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone, timedelta
from typing import Optional, List
import json

from database import get_db
from models.customer import Customer
from models.order import Order
from models.vendor_inquiry import VendorInquiry
from models.product import Product
from models.brand import Brand
from models.announcement import Announcement
from routers.auth import get_admin_customer
from utils.email import send_cart_abandonment_email, send_cart_abandonment_sms

router = APIRouter(prefix="/admin", tags=["admin"])


# ─── Stats / reads ────────────────────────────────────────────────────────────

@router.get("/stats")
def get_stats(admin: Customer = Depends(get_admin_customer), db: Session = Depends(get_db)):
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
def get_all_orders(admin: Customer = Depends(get_admin_customer), db: Session = Depends(get_db)):
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
                {"product_name": i.product_name, "brand": i.brand, "price": i.price, "quantity": i.quantity}
                for i in o.items
            ],
        }
        for o in orders
    ]


@router.get("/customers")
def get_all_customers(admin: Customer = Depends(get_admin_customer), db: Session = Depends(get_db)):
    customers = db.query(Customer).order_by(Customer.created_at.desc()).limit(200).all()
    return [
        {
            "id": c.id, "email": c.email, "first_name": c.first_name, "last_name": c.last_name,
            "email_opt_in": c.email_opt_in, "sms_opt_in": c.sms_opt_in,
            "role": getattr(c, "role", None) or ("admin" if c.is_admin else "customer"),
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in customers
    ]


@router.get("/vendor-inquiries")
def get_inquiries(admin: Customer = Depends(get_admin_customer), db: Session = Depends(get_db)):
    return db.query(VendorInquiry).order_by(VendorInquiry.created_at.desc()).all()


@router.post("/trigger-abandonment")
def trigger_abandonment(admin: Customer = Depends(get_admin_customer), db: Session = Depends(get_db)):
    cutoff = datetime.now(timezone.utc) - timedelta(hours=2)
    abandoned = (
        db.query(Customer)
        .filter(Customer.cart_data != None, Customer.cart_updated_at < cutoff)
        .all()
    )
    sent = 0
    for customer in abandoned:
        try:
            cart_items = json.loads(customer.cart_data or "[]")
            if not cart_items:
                continue
            if customer.email_opt_in:
                send_cart_abandonment_email(customer.email, customer.first_name, cart_items)
            if customer.sms_opt_in and customer.phone:
                send_cart_abandonment_sms(customer.phone, customer.first_name)
            sent += 1
        except Exception:
            pass
    return {"success": True, "notifications_sent": sent}


# ─── Product CRUD ─────────────────────────────────────────────────────────────

class ProductIn(BaseModel):
    brand_id: int
    name: str
    collection: Optional[str] = None
    price: float
    category: str = "Clothing"
    subcategory: Optional[str] = None
    description: Optional[str] = None
    sizes: Optional[List[str]] = None
    image_url: Optional[str] = None
    type: str = "product"
    is_active: bool = True
    is_featured: bool = False
    stock_count: Optional[int] = None


def _serialize_product(p: Product):
    return {
        "id": p.id, "brand_id": p.brand_id, "name": p.name, "collection": p.collection,
        "price": p.price, "category": p.category, "subcategory": p.subcategory,
        "description": p.description,
        "sizes": json.loads(p.sizes) if p.sizes else [],
        "image_url": p.image_url, "type": p.type,
        "is_active": p.is_active,
        "is_featured": getattr(p, "is_featured", False),
        "stock_count": getattr(p, "stock_count", None),
    }


@router.get("/products")
def admin_list_products(admin: Customer = Depends(get_admin_customer), db: Session = Depends(get_db)):
    rows = db.query(Product).order_by(Product.brand_id, Product.name).all()
    return [_serialize_product(p) for p in rows]


@router.post("/products")
def admin_create_product(data: ProductIn, admin: Customer = Depends(get_admin_customer), db: Session = Depends(get_db)):
    p = Product(
        brand_id=data.brand_id, name=data.name, collection=data.collection, price=data.price,
        category=data.category, subcategory=data.subcategory, description=data.description,
        sizes=json.dumps(data.sizes) if data.sizes else None, image_url=data.image_url,
        type=data.type, is_active=data.is_active, is_featured=data.is_featured,
        stock_count=data.stock_count,
    )
    db.add(p); db.commit(); db.refresh(p)
    return _serialize_product(p)


@router.put("/products/{product_id}")
def admin_update_product(product_id: int, data: ProductIn, admin: Customer = Depends(get_admin_customer), db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(404, "Product not found")
    p.brand_id = data.brand_id; p.name = data.name; p.collection = data.collection
    p.price = data.price; p.category = data.category; p.subcategory = data.subcategory
    p.description = data.description
    p.sizes = json.dumps(data.sizes) if data.sizes else None
    p.image_url = data.image_url; p.type = data.type
    p.is_active = data.is_active; p.is_featured = data.is_featured
    p.stock_count = data.stock_count
    db.commit(); db.refresh(p)
    return _serialize_product(p)


@router.delete("/products/{product_id}")
def admin_delete_product(product_id: int, admin: Customer = Depends(get_admin_customer), db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(404, "Product not found")
    db.delete(p); db.commit()
    return {"success": True}


@router.patch("/products/{product_id}/toggle-active")
def admin_toggle_active(product_id: int, admin: Customer = Depends(get_admin_customer), db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(404, "Product not found")
    p.is_active = not p.is_active
    db.commit()
    return {"is_active": p.is_active}


@router.patch("/products/{product_id}/toggle-featured")
def admin_toggle_featured(product_id: int, admin: Customer = Depends(get_admin_customer), db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(404, "Product not found")
    p.is_featured = not getattr(p, "is_featured", False)
    db.commit()
    return {"is_featured": p.is_featured}


# ─── Brand list (for product form dropdown) ───────────────────────────────────

@router.get("/brands")
def admin_list_brands(admin: Customer = Depends(get_admin_customer), db: Session = Depends(get_db)):
    rows = db.query(Brand).order_by(Brand.name).all()
    return [{"id": b.id, "name": b.name} for b in rows]


# ─── Order status ─────────────────────────────────────────────────────────────

class OrderStatusIn(BaseModel):
    status: str


@router.patch("/orders/{order_id}/status")
def admin_update_order_status(order_id: int, data: OrderStatusIn, admin: Customer = Depends(get_admin_customer), db: Session = Depends(get_db)):
    o = db.query(Order).filter(Order.id == order_id).first()
    if not o:
        raise HTTPException(404, "Order not found")
    o.status = data.status
    db.commit()
    return {"id": o.id, "status": o.status}


# ─── Announcements CRUD ───────────────────────────────────────────────────────

class AnnouncementIn(BaseModel):
    title: str
    body: Optional[str] = None
    cta_label: Optional[str] = None
    cta_url: Optional[str] = None
    display_mode: str = "banner"
    is_active: bool = True
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None


def _serialize_announcement(a: Announcement):
    return {
        "id": a.id, "title": a.title, "body": a.body,
        "cta_label": a.cta_label, "cta_url": a.cta_url,
        "display_mode": a.display_mode, "is_active": a.is_active,
        "starts_at": a.starts_at.isoformat() if a.starts_at else None,
        "ends_at": a.ends_at.isoformat() if a.ends_at else None,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }


@router.get("/announcements")
def admin_list_announcements(admin: Customer = Depends(get_admin_customer), db: Session = Depends(get_db)):
    rows = db.query(Announcement).order_by(Announcement.created_at.desc()).all()
    return [_serialize_announcement(a) for a in rows]


@router.post("/announcements")
def admin_create_announcement(data: AnnouncementIn, admin: Customer = Depends(get_admin_customer), db: Session = Depends(get_db)):
    a = Announcement(**data.model_dump())
    db.add(a); db.commit(); db.refresh(a)
    return _serialize_announcement(a)


@router.put("/announcements/{ann_id}")
def admin_update_announcement(ann_id: int, data: AnnouncementIn, admin: Customer = Depends(get_admin_customer), db: Session = Depends(get_db)):
    a = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not a:
        raise HTTPException(404, "Announcement not found")
    for k, v in data.model_dump().items():
        setattr(a, k, v)
    db.commit(); db.refresh(a)
    return _serialize_announcement(a)


@router.delete("/announcements/{ann_id}")
def admin_delete_announcement(ann_id: int, admin: Customer = Depends(get_admin_customer), db: Session = Depends(get_db)):
    a = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not a:
        raise HTTPException(404, "Announcement not found")
    db.delete(a); db.commit()
    return {"success": True}
