from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
import os

from database import get_db
from models.customer import Customer
from models.brand import Brand
from schemas.customer import CustomerRegister, CustomerLogin, CustomerResponse, AuthResponse
from utils.auth import hash_password, verify_password, create_access_token, decode_token

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()
security_optional = HTTPBearer(auto_error=False)

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "").lower()


# ─── Shared dependency: get current customer from Bearer token ────────────────

def get_current_customer(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> Customer:
    try:
        payload = decode_token(credentials.credentials)
        customer_id = int(payload["sub"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=401, detail="Customer not found")
    return customer


def get_optional_customer(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_optional),
    db: Session = Depends(get_db),
) -> Optional[Customer]:
    """Returns the authenticated Customer when a valid token is present,
    or None for guest/anonymous requests. Never raises 401."""
    if credentials is None:
        return None
    try:
        payload = decode_token(credentials.credentials)
        customer_id = int(payload["sub"])
    except Exception:
        return None
    return db.query(Customer).filter(Customer.id == customer_id).first()


def get_admin_customer(customer: Customer = Depends(get_current_customer)) -> Customer:
    if not customer.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return customer


def get_current_vendor(customer: Customer = Depends(get_current_customer)) -> Customer:
    role = getattr(customer, "role", None)
    if role != "vendor" or not getattr(customer, "brand_id", None):
        raise HTTPException(status_code=403, detail="Vendor access required")
    return customer


def _token_claims(customer: Customer) -> dict:
    return {
        "sub": str(customer.id),
        "is_admin": bool(customer.is_admin),
        "role": getattr(customer, "role", None) or ("admin" if customer.is_admin else "customer"),
        "brand_id": getattr(customer, "brand_id", None),
    }


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/register", response_model=AuthResponse)
def register(data: CustomerRegister, db: Session = Depends(get_db)):
    if db.query(Customer).filter(Customer.email == data.email.lower()).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    is_admin = bool(ADMIN_EMAIL and data.email.lower() == ADMIN_EMAIL)

    customer = Customer(
        email=data.email.lower(),
        password_hash=hash_password(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        phone=data.phone,
        email_opt_in=data.email_opt_in,
        sms_opt_in=data.sms_opt_in,
        is_admin=is_admin,
        role="admin" if is_admin else "customer",
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)

    return {"token": create_access_token(_token_claims(customer)), "customer": customer}


class VendorRegister(BaseModel):
    # Customer fields
    email: str
    password: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    # Brand fields
    brand_name: str
    tagline: Optional[str] = None
    bio: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    instagram: Optional[str] = None


@router.post("/register-vendor", response_model=AuthResponse)
def register_vendor(data: VendorRegister, db: Session = Depends(get_db)):
    if db.query(Customer).filter(Customer.email == data.email.lower()).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    brand = Brand(
        name=data.brand_name,
        tagline=data.tagline,
        bio=data.bio,
        category=data.category,
        location=data.location,
        instagram=data.instagram,
        is_active=False,  # pending admin approval
    )
    db.add(brand)
    db.flush()  # get brand.id without committing

    customer = Customer(
        email=data.email.lower(),
        password_hash=hash_password(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        phone=data.phone,
        is_admin=False,
        role="vendor",
        brand_id=brand.id,
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)

    return {"token": create_access_token(_token_claims(customer)), "customer": customer}


@router.post("/login", response_model=AuthResponse)
def login(data: CustomerLogin, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.email == data.email.lower()).first()
    if not customer or not verify_password(data.password, customer.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {"token": create_access_token(_token_claims(customer)), "customer": customer}


@router.get("/me", response_model=CustomerResponse)
def get_me(customer: Customer = Depends(get_current_customer)):
    return customer
