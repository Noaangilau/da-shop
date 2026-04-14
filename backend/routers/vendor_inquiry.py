from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.vendor_inquiry import VendorInquiry
from schemas.vendor_inquiry import VendorInquiryCreate, VendorInquiryResponse

router = APIRouter()


@router.post("/vendor-inquiry", response_model=VendorInquiryResponse)
def submit_vendor_inquiry(payload: VendorInquiryCreate, db: Session = Depends(get_db)):
    inquiry = VendorInquiry(
        business_name=payload.business_name,
        contact_name=payload.contact_name,
        email=payload.email,
        instagram_handle=payload.instagram_handle,
        product_category=payload.product_category,
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)
    return inquiry
