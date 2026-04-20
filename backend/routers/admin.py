from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict
import json
import zipfile
import io

from database import get_db
from models.customer import Customer
from models.order import Order
from models.vendor_inquiry import VendorInquiry
from models.product import Product
from models.brand import Brand
from models.announcement import Announcement
from models.tee_template import TeeTemplate
from routers.auth import get_admin_customer
from services.mockup import composite, DEFAULT_ANCHOR
from services.media import save_upload, save_bytes
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
            "brand_id": getattr(c, "brand_id", None),
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in customers
    ]


class CustomerRoleIn(BaseModel):
    role: str  # customer | vendor | admin
    brand_id: Optional[int] = None


@router.patch("/customers/{customer_id}/role")
def admin_set_customer_role(customer_id: int, data: CustomerRoleIn, admin: Customer = Depends(get_admin_customer), db: Session = Depends(get_db)):
    if data.role not in ("customer", "vendor", "admin"):
        raise HTTPException(400, "role must be customer | vendor | admin")
    if data.role == "vendor" and not data.brand_id:
        raise HTTPException(400, "brand_id required when promoting to vendor")
    c = db.query(Customer).filter(Customer.id == customer_id).first()
    if not c:
        raise HTTPException(404, "Customer not found")
    c.role = data.role
    c.is_admin = (data.role == "admin")
    c.brand_id = data.brand_id if data.role == "vendor" else None
    db.commit()
    return {"id": c.id, "role": c.role, "is_admin": c.is_admin, "brand_id": c.brand_id}


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
    variants: Optional[List[Dict[str, str]]] = None
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
        "variants": json.loads(p.variants) if getattr(p, "variants", None) else None,
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
        sizes=json.dumps(data.sizes) if data.sizes else None,
        variants=json.dumps(data.variants) if data.variants else None,
        image_url=data.image_url,
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
    p.variants = json.dumps(data.variants) if data.variants else None
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


# ─── Image upload ─────────────────────────────────────────────────────────────

@router.post("/upload-image")
async def admin_upload_image(file: UploadFile = File(...), admin: Customer = Depends(get_admin_customer)):
    url = await save_upload(file, prefix="admin")
    return {"image_url": url}


# ─── Full Brand CRUD ──────────────────────────────────────────────────────────

class BrandIn(BaseModel):
    name: str
    tagline: Optional[str] = None
    bio: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    instagram: Optional[str] = None
    logo_white_url: Optional[str] = None
    logo_navy_url: Optional[str] = None
    hero_image_url: Optional[str] = None
    card_image_url: Optional[str] = None
    is_active: bool = True


def _serialize_brand(b: Brand):
    return {
        "id": b.id, "name": b.name, "tagline": b.tagline, "bio": b.bio,
        "category": b.category, "location": b.location, "instagram": b.instagram,
        "logo_white_url": b.logo_white_url, "logo_navy_url": b.logo_navy_url,
        "hero_image_url": b.hero_image_url, "card_image_url": b.card_image_url,
        "is_active": b.is_active,
        "created_at": b.created_at.isoformat() if b.created_at else None,
    }


@router.get("/brands-full")
def admin_list_brands_full(admin: Customer = Depends(get_admin_customer), db: Session = Depends(get_db)):
    return [_serialize_brand(b) for b in db.query(Brand).order_by(Brand.name).all()]


@router.post("/brands")
def admin_create_brand(data: BrandIn, admin: Customer = Depends(get_admin_customer), db: Session = Depends(get_db)):
    b = Brand(**data.model_dump())
    db.add(b); db.commit(); db.refresh(b)
    return _serialize_brand(b)


@router.put("/brands/{brand_id}")
def admin_update_brand(brand_id: int, data: BrandIn, admin: Customer = Depends(get_admin_customer), db: Session = Depends(get_db)):
    b = db.query(Brand).filter(Brand.id == brand_id).first()
    if not b:
        raise HTTPException(404, "Brand not found")
    for k, v in data.model_dump().items():
        setattr(b, k, v)
    db.commit(); db.refresh(b)
    return _serialize_brand(b)


@router.patch("/brands/{brand_id}/approve")
def admin_approve_brand(brand_id: int, admin: Customer = Depends(get_admin_customer), db: Session = Depends(get_db)):
    b = db.query(Brand).filter(Brand.id == brand_id).first()
    if not b:
        raise HTTPException(404, "Brand not found")
    b.is_active = True
    db.commit()
    return {"id": b.id, "is_active": b.is_active}


@router.patch("/brands/{brand_id}/revoke")
def admin_revoke_brand(brand_id: int, admin: Customer = Depends(get_admin_customer), db: Session = Depends(get_db)):
    b = db.query(Brand).filter(Brand.id == brand_id).first()
    if not b:
        raise HTTPException(404, "Brand not found")
    b.is_active = False
    db.commit()
    return {"id": b.id, "is_active": b.is_active}


# ─── Vendor approvals (list customers with role=vendor) ───────────────────────

@router.get("/vendors")
def admin_list_vendors(admin: Customer = Depends(get_admin_customer), db: Session = Depends(get_db)):
    rows = db.query(Customer).filter(Customer.role == "vendor").order_by(Customer.created_at.desc()).all()
    out = []
    for c in rows:
        brand = db.query(Brand).filter(Brand.id == c.brand_id).first() if c.brand_id else None
        out.append({
            "id": c.id, "email": c.email, "first_name": c.first_name, "last_name": c.last_name,
            "brand_id": c.brand_id,
            "brand": _serialize_brand(brand) if brand else None,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })
    return out


# ─── Tee templates ────────────────────────────────────────────────────────────

def _serialize_template(t: TeeTemplate):
    return {
        "id": t.id, "name": t.name, "color": t.color, "image_url": t.image_url,
        "anchor": json.loads(t.anchor_json) if t.anchor_json else None,
        "created_at": t.created_at.isoformat() if t.created_at else None,
    }


@router.get("/tee-templates")
def admin_list_tee_templates(admin: Customer = Depends(get_admin_customer), db: Session = Depends(get_db)):
    return [_serialize_template(t) for t in db.query(TeeTemplate).order_by(TeeTemplate.name).all()]


@router.post("/tee-templates")
async def admin_create_tee_template(
    name: str = Form(...),
    color: Optional[str] = Form(None),
    anchor_json: Optional[str] = Form(None),
    file: UploadFile = File(...),
    admin: Customer = Depends(get_admin_customer),
    db: Session = Depends(get_db),
):
    image_url = await save_upload(file, prefix="tee")
    t = TeeTemplate(name=name, color=color, image_url=image_url, anchor_json=anchor_json)
    db.add(t); db.commit(); db.refresh(t)
    return _serialize_template(t)


@router.delete("/tee-templates/{template_id}")
def admin_delete_tee_template(template_id: int, admin: Customer = Depends(get_admin_customer), db: Session = Depends(get_db)):
    t = db.query(TeeTemplate).filter(TeeTemplate.id == template_id).first()
    if not t:
        raise HTTPException(404, "Template not found")
    db.delete(t); db.commit()
    return {"success": True}


# ─── Mockup Studio ────────────────────────────────────────────────────────────

def _load_template_bytes(template: TeeTemplate) -> bytes:
    """Read bytes of a stored tee image. image_url is `/media/<filename>`."""
    from services.media import MEDIA_DIR
    if not template.image_url or not template.image_url.startswith("/media/"):
        raise HTTPException(500, f"Template {template.id} has no stored image")
    filename = template.image_url.split("/media/", 1)[1]
    path = MEDIA_DIR / filename
    if not path.is_file():
        raise HTTPException(500, f"Template file missing: {filename}")
    return path.read_bytes()


def _resolve_anchor(override_json: Optional[str], template: Optional[TeeTemplate]) -> dict:
    if override_json:
        try:
            return json.loads(override_json)
        except Exception:
            raise HTTPException(400, "anchor_json must be valid JSON")
    if template and template.anchor_json:
        return json.loads(template.anchor_json)
    return DEFAULT_ANCHOR


@router.post("/mockup/preview")
async def admin_mockup_preview(
    design: UploadFile = File(...),
    template_id: int = Form(...),
    anchor_json: Optional[str] = Form(None),
    admin: Customer = Depends(get_admin_customer),
    db: Session = Depends(get_db),
):
    template = db.query(TeeTemplate).filter(TeeTemplate.id == template_id).first()
    if not template:
        raise HTTPException(404, "Template not found")
    anchor = _resolve_anchor(anchor_json, template)
    design_bytes = await design.read()
    out = composite(design_bytes, _load_template_bytes(template), anchor=anchor)
    return Response(content=out, media_type="image/png")


@router.post("/mockup/generate")
async def admin_mockup_generate(
    design: UploadFile = File(...),
    template_ids: str = Form(...),  # comma-separated ids
    anchor_json: Optional[str] = Form(None),
    admin: Customer = Depends(get_admin_customer),
    db: Session = Depends(get_db),
):
    ids = [int(x) for x in template_ids.split(",") if x.strip()]
    if not ids:
        raise HTTPException(400, "template_ids required")
    design_bytes = await design.read()
    results = []
    for tid in ids:
        template = db.query(TeeTemplate).filter(TeeTemplate.id == tid).first()
        if not template:
            continue
        anchor = _resolve_anchor(anchor_json, template)
        out = composite(design_bytes, _load_template_bytes(template), anchor=anchor)
        url = save_bytes(out, prefix=f"mockup-t{tid}", ext="png")
        results.append({"template_id": tid, "template_name": template.name, "image_url": url})
    return {"results": results}


@router.post("/mockup/bulk")
async def admin_mockup_bulk(
    designs_zip: UploadFile = File(...),
    tees_zip: UploadFile = File(...),
    combos_json: str = Form(...),
    anchor_json: Optional[str] = Form(None),
    admin: Customer = Depends(get_admin_customer),
):
    """Composite many design×tee pairs in one request. combos is a list of
    {design_name, tee_name, output_name?} entries; names are zip-member basenames."""
    try:
        combos = json.loads(combos_json)
    except Exception:
        raise HTTPException(400, "combos_json must be valid JSON")
    anchor = _resolve_anchor(anchor_json, None)

    def _zip_index(data: bytes) -> dict:
        zf = zipfile.ZipFile(io.BytesIO(data))
        return {_basename(n): n for n in zf.namelist() if not n.endswith("/")}, zf

    designs_data = await designs_zip.read()
    tees_data = await tees_zip.read()
    design_index, dzf = _zip_index(designs_data)
    tee_index, tzf = _zip_index(tees_data)

    results = []
    for combo in combos:
        d_name = combo.get("design_name")
        t_name = combo.get("tee_name")
        if d_name not in design_index or t_name not in tee_index:
            results.append({"design_name": d_name, "tee_name": t_name, "error": "missing in zip"})
            continue
        d_bytes = dzf.read(design_index[d_name])
        t_bytes = tzf.read(tee_index[t_name])
        try:
            out = composite(d_bytes, t_bytes, anchor=anchor)
            url = save_bytes(out, prefix="mockup-bulk", ext="png")
            results.append({"design_name": d_name, "tee_name": t_name, "image_url": url})
        except Exception as e:
            results.append({"design_name": d_name, "tee_name": t_name, "error": str(e)})
    return {"results": results}


def _basename(name: str) -> str:
    return name.rsplit("/", 1)[-1]
