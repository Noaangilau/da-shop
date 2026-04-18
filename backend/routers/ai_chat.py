import os
import re
import json
import logging
from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models.product import Product
from models.brand import Brand
from models.chat_log import ChatLog

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["ai"])

_STATIC_CONTEXT = """
You are DA SHOP's helpful shopping assistant. DA SHOP is a Pacific Islander marketplace selling clothing and lifestyle products.

Guidelines:
- Keep answers short (2–4 sentences).
- Only quote prices that appear in the LIVE CATALOG below — never invent prices.
- Help customers find products, answer sizing and shipping questions, and guide them to the right brand.
- Free shipping on orders over $150. Ships from New Zealand (NZ + international).
- New drops every week.
- If asked about something unrelated to shopping, gently redirect.
"""


def _build_system_prompt(db: Session) -> str:
    """Build a dynamic system prompt from live DB data."""
    try:
        brands = db.query(Brand).filter(Brand.is_active == True).order_by(Brand.name).all()
        products = db.query(Product).filter(Product.is_active == True).order_by(Product.brand_id, Product.name).all()

        brand_map = {b.id: b.name for b in brands}

        lines = [_STATIC_CONTEXT.strip(), "", "=== LIVE CATALOG ==="]
        for brand in brands:
            brand_products = [p for p in products if p.brand_id == brand.id]
            if not brand_products:
                continue
            lines.append(f"\n**{brand.name}**{(' — ' + brand.tagline) if brand.tagline else ''}")
            if brand.category:
                lines.append(f"Category: {brand.category}")
            for p in brand_products:
                sizes_str = ""
                if p.sizes:
                    try:
                        sizes = json.loads(p.sizes)
                        if sizes:
                            sizes_str = f" | Sizes: {', '.join(sizes)}"
                    except Exception:
                        pass
                collection_str = f" [{p.collection}]" if p.collection else ""
                lines.append(f"  • {p.name}{collection_str} — ${p.price:.2f}{sizes_str}")

        if not brands:
            lines.append("(No active brands found)")

        lines.append("\n=== END CATALOG ===")
        return "\n".join(lines)

    except Exception as exc:
        logger.error(f"[AI_CHAT] Failed to build dynamic prompt: {exc}")
        return _STATIC_CONTEXT


def _extract_prices_from_text(text: str) -> List[float]:
    """Extract dollar amounts mentioned in AI response."""
    return [float(m) for m in re.findall(r'\$(\d+(?:\.\d{1,2})?)', text)]


def _get_valid_prices(db: Session) -> set:
    """Return set of all valid prices (as floats) from active products."""
    rows = db.query(Product.price).filter(Product.is_active == True).all()
    return {round(r.price, 2) for r in rows}


def _check_hallucinations(reply: str, db: Session) -> Optional[str]:
    """Return JSON string of flagged prices, or None if all prices are valid."""
    mentioned = _extract_prices_from_text(reply)
    if not mentioned:
        return None
    valid = _get_valid_prices(db)
    flagged = [p for p in mentioned if round(p, 2) not in valid]
    return json.dumps(flagged) if flagged else None


def _log_message(
    db: Session,
    *,
    role: str,
    message: str,
    session_id: Optional[str],
    customer_id: Optional[int],
    tokens_used: Optional[int] = None,
    model: Optional[str] = None,
    hallucination_flag: Optional[str] = None,
) -> None:
    try:
        db.add(ChatLog(
            customer_id=customer_id,
            session_id=session_id,
            role=role,
            message=message,
            tokens_used=tokens_used,
            model=model,
            hallucination_flag=hallucination_flag,
        ))
        db.commit()
    except Exception as exc:
        logger.error(f"[AI_CHAT] Failed to log message: {exc}")


class ChatMsg(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMsg]] = []
    session_id: Optional[str] = None
    customer_id: Optional[int] = None


@router.post("/chat")
def chat(data: ChatRequest, db: Session = Depends(get_db)):
    api_key = os.getenv("ANTHROPIC_API_KEY")

    # Log user message regardless of AI availability
    _log_message(
        db,
        role="user",
        message=data.message,
        session_id=data.session_id,
        customer_id=data.customer_id,
    )

    if not api_key:
        fallback = "AI assistant is unavailable right now. Browse our brands or contact us directly for help."
        _log_message(
            db,
            role="assistant",
            message=fallback,
            session_id=data.session_id,
            customer_id=data.customer_id,
            model="skipped",
        )
        return {"reply": fallback}

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)

        system_prompt = _build_system_prompt(db)
        messages = [{"role": m.role, "content": m.content} for m in (data.history or [])[-6:]]
        messages.append({"role": "user", "content": data.message})

        model = "claude-haiku-4-5-20251001"
        response = client.messages.create(
            model=model,
            max_tokens=300,
            system=system_prompt,
            messages=messages,
        )

        reply = response.content[0].text
        tokens = response.usage.input_tokens + response.usage.output_tokens
        hallucination_flag = _check_hallucinations(reply, db)

        if hallucination_flag:
            flagged = json.loads(hallucination_flag)
            logger.warning(f"[AI_CHAT] Hallucinated prices detected: {flagged} — scrubbing reply")
            # Scrub: replace each hallucinated price mention with "[price unavailable]"
            for price in flagged:
                reply = re.sub(
                    rf'\${re.escape(str(price))}|\${re.escape(f"{price:.2f}")}',
                    "[price unavailable]",
                    reply,
                )

        _log_message(
            db,
            role="assistant",
            message=reply,
            session_id=data.session_id,
            customer_id=data.customer_id,
            tokens_used=tokens,
            model=model,
            hallucination_flag=hallucination_flag,
        )

        return {"reply": reply}

    except Exception as exc:
        logger.error(f"[AI_CHAT] Anthropic call failed: {exc}")
        fallback = "Sorry, I'm having trouble right now. Feel free to browse our brands or reach out directly."
        _log_message(
            db,
            role="assistant",
            message=fallback,
            session_id=data.session_id,
            customer_id=data.customer_id,
            model="error",
        )
        return {"reply": fallback}
