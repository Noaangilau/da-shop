"""
Discount code validation.

POST /discounts/validate  — validate a code against the current subtotal.

Active codes are defined in ACTIVE_CODES below. Add new codes here until a
discount model is introduced. Codes are case-insensitive on input.
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/discounts", tags=["discounts"])

# ── Active discount codes ──────────────────────────────────────────────────────
# type: "percent" → value is percentage off  |  "flat" → value is dollars off
ACTIVE_CODES: dict = {
    "PACIFIC10": {"type": "percent", "value": 10,  "label": "10% off"},
    "WELCOME5":  {"type": "flat",    "value": 5.0, "label": "$5 off"},
    "SCHOOL20":  {"type": "percent", "value": 20,  "label": "20% off — school store"},
}


class DiscountValidateRequest(BaseModel):
    code:     str   = Field(..., min_length=1, max_length=64)
    subtotal: float = Field(..., gt=0)


class DiscountValidateResponse(BaseModel):
    code:        str
    label:       str
    saving:      float
    new_subtotal: float


@router.post("/validate", response_model=DiscountValidateResponse)
def validate_discount(data: DiscountValidateRequest):
    code     = data.code.strip().upper()
    discount = ACTIVE_CODES.get(code)

    if not discount:
        logger.info(f"[DISCOUNTS] Invalid code attempted: {code!r}")
        raise HTTPException(status_code=404, detail="Invalid or expired discount code.")

    if discount["type"] == "percent":
        saving = round(data.subtotal * discount["value"] / 100, 2)
    else:
        saving = round(min(float(discount["value"]), data.subtotal), 2)

    new_subtotal = round(data.subtotal - saving, 2)

    logger.info(f"[DISCOUNTS] Code {code!r} applied — saving ${saving:.2f}")
    return DiscountValidateResponse(
        code=code,
        label=discount["label"],
        saving=saving,
        new_subtotal=new_subtotal,
    )
