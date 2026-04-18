from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.product import Product
from schemas.product import ProductOut

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=List[ProductOut])
def list_products(
    category: Optional[str] = Query(None),
    collection: Optional[str] = Query(None),
    brand_id: Optional[int] = Query(None),
    kaikefiu: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Product).filter(Product.is_active == True)
    if category:
        q = q.filter(Product.category.ilike(f"%{category}%"))
    if collection:
        q = q.filter(Product.collection.ilike(f"%{collection}%"))
    if brand_id is not None:
        q = q.filter(Product.brand_id == brand_id)
    if kaikefiu is not None:
        q = q.filter(Product.kaikefiu == kaikefiu)
    return q.all()


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
