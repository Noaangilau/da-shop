from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, List, Dict
import json

from database import get_db
from models.customer import Customer
from models.product import Product
from models.brand import Brand
from routers.auth import get_current_vendor
from services.media import save_upload

router = APIRouter(prefix="/vendor", tags=["vendor"])


# ─── Vendor's own brand ───────────────────────────────────────────────────────

class VendorBrandIn(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    bio: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    instagram: Optional[str] = None
    logo_white_url: Optional[str] = None
    logo_navy_url: Optional[str] = None
    hero_image_url: Optional[str] = None
    card_image_url: Optional[str] = None


def _serialize_brand(b: Brand):
    return {
        "id": b.id, "name": b.name, "tagline": b.tagline, "bio": b.bio,
        "category": b.category, "location": b.location, "instagram": b.instagram,
        "logo_white_url": b.logo_white_url, "logo_navy_url": b.logo_navy_url,
        "hero_image_url": b.hero_image_url, "card_image_url": b.card_image_url,
        "is_active": b.is_active,
    }


@router.get("/brand")
def get_own_brand(vendor: Customer = Depends(get_current_vendor), db: Session = Depends(get_db)):
    b = db.query(Brand).filter(Brand.id == vendor.brand_id).first()
    if not b:
        raise HTTPException(404, "Brand not found")
    return _serialize_brand(b)


@router.put("/brand")
def update_own_brand(data: VendorBrandIn, vendor: Customer = Depends(get_current_vendor), db: Session = Depends(get_db)):
    b = db.query(Brand).filter(Brand.id == vendor.brand_id).first()
    if not b:
        raise HTTPException(404, "Brand not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(b, k, v)
    db.commit(); db.refresh(b)
    return _serialize_brand(b)


# ─── Vendor-scoped product CRUD ───────────────────────────────────────────────

class VendorProductIn(BaseModel):
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
def list_own_products(vendor: Customer = Depends(get_current_vendor), db: Session = Depends(get_db)):
    rows = db.query(Product).filter(Product.brand_id == vendor.brand_id).order_by(Product.name).all()
    return [_serialize_product(p) for p in rows]


@router.post("/products")
def create_own_product(data: VendorProductIn, vendor: Customer = Depends(get_current_vendor), db: Session = Depends(get_db)):
    p = Product(
        brand_id=vendor.brand_id,  # forced — ignore any client value
        name=data.name, collection=data.collection, price=data.price,
        category=data.category, subcategory=data.subcategory, description=data.description,
        sizes=json.dumps(data.sizes) if data.sizes else None,
        variants=json.dumps(data.variants) if data.variants else None,
        image_url=data.image_url,
        type=data.type, is_active=data.is_active, stock_count=data.stock_count,
        is_featured=False,  # vendors cannot self-feature
    )
    db.add(p); db.commit(); db.refresh(p)
    return _serialize_product(p)


@router.put("/products/{product_id}")
def update_own_product(product_id: int, data: VendorProductIn, vendor: Customer = Depends(get_current_vendor), db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p or p.brand_id != vendor.brand_id:
        raise HTTPException(404, "Product not found")
    p.name = data.name; p.collection = data.collection; p.price = data.price
    p.category = data.category; p.subcategory = data.subcategory; p.description = data.description
    p.sizes = json.dumps(data.sizes) if data.sizes else None
    p.variants = json.dumps(data.variants) if data.variants else None
    p.image_url = data.image_url; p.type = data.type
    p.is_active = data.is_active; p.stock_count = data.stock_count
    db.commit(); db.refresh(p)
    return _serialize_product(p)


@router.delete("/products/{product_id}")
def delete_own_product(product_id: int, vendor: Customer = Depends(get_current_vendor), db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p or p.brand_id != vendor.brand_id:
        raise HTTPException(404, "Product not found")
    db.delete(p); db.commit()
    return {"success": True}


@router.post("/upload-image")
async def vendor_upload_image(file: UploadFile = File(...), vendor: Customer = Depends(get_current_vendor)):
    url = await save_upload(file, prefix=f"brand{vendor.brand_id}")
    return {"image_url": url}
