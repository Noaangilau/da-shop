from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.brand import Brand
from models.product import Product
from schemas.brand import BrandOut
from schemas.product import ProductOut

router = APIRouter(prefix="/brands", tags=["brands"])


@router.get("", response_model=List[BrandOut])
def list_brands(db: Session = Depends(get_db)):
    return db.query(Brand).filter(Brand.is_active == True).all()


@router.get("/{brand_id}", response_model=BrandOut)
def get_brand(brand_id: int, db: Session = Depends(get_db)):
    brand = db.query(Brand).filter(Brand.id == brand_id, Brand.is_active == True).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand


@router.get("/{brand_id}/products", response_model=List[ProductOut])
def get_brand_products(brand_id: int, db: Session = Depends(get_db)):
    brand = db.query(Brand).filter(Brand.id == brand_id, Brand.is_active == True).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return db.query(Product).filter(Product.brand_id == brand_id, Product.is_active == True).all()
