from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import os

router = APIRouter(prefix="/ai", tags=["ai"])

SYSTEM_PROMPT = """You are DA SHOP's helpful shopping assistant. DA SHOP is a Pacific culture marketplace.

Vendors and products:
1. ffiliku — Pacific-inspired clothing. Linen tapa shirts ($120), linen trousers ($95), wave hoodies ($110), bucket hats ($48), canvas totes ($65). Sizes XS–3XL.
2. Mana Jewelry — Handcrafted Pacific jewelry. Shell lei necklaces ($55), bone carving pendants ($120), gold-plated fern bracelets ($85), sterling silver wave rings ($45), pearl drop earrings ($65).
3. Aloha Art Studio — Paintings & prints. Canvas prints from $120, original paintings up to $650, digital prints from $45. Custom portrait commissions from $450.
4. Island Ink Co. — Pacific art + tattoo services. Tatau flash sheets ($85), fine-art prints ($45), sticker packs ($18). Tattoo commissions from $350, custom murals from $800.

Categories: Clothing, Jewelry, Paintings & Prints, Art Services.
Free shipping on orders over $150. New drops every week.
Ships from New Zealand to NZ + internationally.

Keep your answers short (2–4 sentences). Help customers find the right product, answer sizing and shipping questions, and guide them toward the right brand. If asked about something unrelated to shopping, gently redirect."""


class ChatMsg(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMsg]] = []


@router.post("/chat")
def chat(data: ChatRequest):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return {"reply": "AI assistant is unavailable right now. Browse our brands or contact us directly for help."}

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)

        messages = [{"role": m.role, "content": m.content} for m in (data.history or [])[-6:]]
        messages.append({"role": "user", "content": data.message})

        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=300,
            system=SYSTEM_PROMPT,
            messages=messages,
        )
        return {"reply": response.content[0].text}

    except Exception:
        return {"reply": "Sorry, I'm having trouble right now. Feel free to browse our brands or reach out directly."}
