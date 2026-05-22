"""
Email + SMS notification utilities.

Providers:
  Email — Resend (resend.com). Set RESEND_API_KEY + RESEND_FROM_EMAIL env vars.
  SMS   — Twilio. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_PHONE env vars.

When env vars are absent the functions fall back to console logging (safe for development).
Every send attempt is written to notification_logs when a db session is passed.
"""

import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

SHOP_URL       = os.getenv("SHOP_URL", "https://da-shop.vercel.app")
FROM_EMAIL     = os.getenv("RESEND_FROM_EMAIL", "noreply@dashop.co.nz")
SHOP_NAME      = "DA SHOP"


# ── Low-level send helpers ─────────────────────────────────────────────────────

def _send_via_resend(to: str, subject: str, html: str) -> str:
    """Send via Resend API. Returns message ID. Raises on failure."""
    import resend  # type: ignore
    resend.api_key = os.environ["RESEND_API_KEY"]
    response = resend.Emails.send({
        "from":    FROM_EMAIL,
        "to":      [to],
        "subject": subject,
        "html":    html,
    })
    return response.get("id", "")


def _send_via_twilio(to: str, body: str) -> str:
    """Send via Twilio. Returns message SID. Raises on failure."""
    from twilio.rest import Client  # type: ignore
    client = Client(os.environ["TWILIO_ACCOUNT_SID"], os.environ["TWILIO_AUTH_TOKEN"])
    msg = client.messages.create(
        body=body,
        from_=os.environ["TWILIO_FROM_PHONE"],
        to=to,
    )
    return msg.sid


def _log(db, *, channel, recipient, template, subject=None,
         status, error=None, provider_id=None, order_id=None, customer_id=None):
    if db is None:
        return
    try:
        from models.notification_log import NotificationLog
        db.add(NotificationLog(
            channel=channel, recipient=recipient, template=template,
            subject=subject, status=status, error=error,
            provider_id=provider_id, order_id=order_id, customer_id=customer_id,
        ))
        db.commit()
    except Exception as exc:
        logger.warning(f"[NOTIFY] Failed to write notification log: {exc}")


# ── Mid-level dispatch ─────────────────────────────────────────────────────────

def send_email(
    to: str,
    subject: str,
    html: str,
    *,
    template: str,
    db=None,
    order_id: Optional[int] = None,
    customer_id: Optional[int] = None,
):
    api_key = os.getenv("RESEND_API_KEY")
    if not api_key:
        logger.info(f"[EMAIL:dev] To: {to} | Subject: {subject}")
        print(f"\n--- EMAIL (dev/console) ---\nTo: {to}\nSubject: {subject}\n{html}\n---\n")
        _log(db, channel="email", recipient=to, template=template, subject=subject,
             status="skipped", error="RESEND_API_KEY not set",
             order_id=order_id, customer_id=customer_id)
        return

    try:
        provider_id = _send_via_resend(to, subject, html)
        logger.info(f"[EMAIL:sent] id={provider_id} to={to} subject={subject}")
        _log(db, channel="email", recipient=to, template=template, subject=subject,
             status="sent", provider_id=provider_id,
             order_id=order_id, customer_id=customer_id)
    except Exception as exc:
        logger.error(f"[EMAIL:failed] to={to} error={exc}")
        _log(db, channel="email", recipient=to, template=template, subject=subject,
             status="failed", error=str(exc),
             order_id=order_id, customer_id=customer_id)


def send_sms(
    to: str,
    message: str,
    *,
    template: str,
    db=None,
    order_id: Optional[int] = None,
    customer_id: Optional[int] = None,
):
    sid = os.getenv("TWILIO_ACCOUNT_SID")
    token = os.getenv("TWILIO_AUTH_TOKEN")
    if not sid or not token:
        logger.info(f"[SMS:dev] To: {to} | {message}")
        print(f"\n--- SMS (dev/console) ---\nTo: {to}\n{message}\n---\n")
        _log(db, channel="sms", recipient=to, template=template,
             status="skipped", error="TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN not set",
             order_id=order_id, customer_id=customer_id)
        return

    try:
        provider_id = _send_via_twilio(to, message)
        logger.info(f"[SMS:sent] sid={provider_id} to={to}")
        _log(db, channel="sms", recipient=to, template=template,
             status="sent", provider_id=provider_id,
             order_id=order_id, customer_id=customer_id)
    except Exception as exc:
        logger.error(f"[SMS:failed] to={to} error={exc}")
        _log(db, channel="sms", recipient=to, template=template,
             status="failed", error=str(exc),
             order_id=order_id, customer_id=customer_id)


# ── Email templates ────────────────────────────────────────────────────────────

def _base_html(title: str, body_html: str) -> str:
    """Branded DA SHOP email shell — ink/paper palette, monospace labels, zero border-radius."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>{title}</title>
  <style>
    body      {{ font-family: Arial, Helvetica, sans-serif; background:#e8e4dd;
                margin:0; padding:0; color:#0a0a0a; -webkit-font-smoothing:antialiased; }}
    .outer    {{ max-width:600px; margin:32px auto; padding:0 16px 40px; }}

    /* ── Header bar ── */
    .hdr      {{ background:#0a0a0a; padding:20px 32px; display:block; }}
    .hdr-logo {{ font-family: Arial Black, Arial, sans-serif; font-size:20px;
                font-weight:900; letter-spacing:-0.02em; text-transform:uppercase;
                color:#f5f1ea; text-decoration:none; display:inline-block; }}
    .hdr-dot  {{ color:#b04b3a; }}
    .hdr-sub  {{ font-family: 'Courier New', Courier, monospace; font-size:10px;
                letter-spacing:0.16em; text-transform:uppercase; color:#f5f1ea;
                opacity:0.45; margin-top:4px; }}

    /* ── Body card ── */
    .card     {{ background:#ffffff; border:1px solid #d9d4ca; padding:36px 32px; }}
    .eyebrow  {{ font-family: 'Courier New', Courier, monospace; font-size:10px;
                letter-spacing:0.2em; text-transform:uppercase; color:#6b6b6b;
                margin:0 0 10px; }}
    .headline {{ font-family: Arial Black, Arial, sans-serif; font-size:32px;
                font-weight:900; text-transform:uppercase; letter-spacing:-0.02em;
                line-height:1; color:#0a0a0a; margin:0 0 20px; }}
    .body-txt {{ font-size:14px; line-height:1.65; color:#444444; margin:0 0 24px; }}

    /* ── Divider ── */
    .rule     {{ border:none; border-top:1px solid #d9d4ca; margin:24px 0; }}
    .rule-ink {{ border:none; border-top:1px solid #0a0a0a; margin:20px 0; }}

    /* ── Order items table ── */
    table     {{ width:100%; border-collapse:collapse; margin:0 0 24px; }}
    th        {{ font-family: 'Courier New', Courier, monospace; font-size:9px;
                letter-spacing:0.16em; text-transform:uppercase; color:#6b6b6b;
                padding:0 0 8px; border-bottom:1px solid #0a0a0a;
                text-align:left; font-weight:400; }}
    td        {{ font-size:13px; color:#0a0a0a; padding:10px 0;
                border-bottom:1px solid #d9d4ca; vertical-align:top; }}
    td.mono   {{ font-family: 'Courier New', Courier, monospace; font-size:11px;
                letter-spacing:0.04em; }}
    td.right  {{ text-align:right; }}
    .item-name  {{ font-weight:700; text-transform:uppercase;
                  font-size:12px; letter-spacing:0.03em; }}
    .item-meta  {{ font-family: 'Courier New', Courier, monospace; font-size:10px;
                  letter-spacing:0.08em; text-transform:uppercase;
                  color:#6b6b6b; margin-top:2px; }}

    /* ── Total row ── */
    .total-row  {{ display:block; margin:4px 0 0; }}
    .total-lbl  {{ font-family: 'Courier New', Courier, monospace; font-size:10px;
                  letter-spacing:0.16em; text-transform:uppercase; color:#6b6b6b; }}
    .total-val  {{ font-family: Arial Black, Arial, sans-serif; font-size:26px;
                  font-weight:900; color:#0a0a0a; }}

    /* ── CTA button ── */
    .btn-wrap {{ margin:28px 0 0; }}
    .btn      {{ display:inline-block; background:#0a0a0a; color:#f5f1ea;
                padding:14px 36px; font-family: 'Courier New', Courier, monospace;
                font-size:11px; letter-spacing:0.14em; text-transform:uppercase;
                font-weight:700; text-decoration:none; }}

    /* ── Footer ── */
    .ftr      {{ padding:24px 0 0; text-align:center; }}
    .ftr p    {{ font-family: 'Courier New', Courier, monospace; font-size:10px;
                letter-spacing:0.1em; text-transform:uppercase; color:#6b6b6b;
                margin:4px 0; }}
    .ftr a    {{ color:#6b6b6b; text-decoration:none; }}
    .ftr a:hover {{ color:#0a0a0a; }}
  </style>
</head>
<body>
  <div class="outer">

    <!-- Header -->
    <div class="hdr">
      <div class="hdr-logo">DA SHOP<span class="hdr-dot">.</span></div>
      <div class="hdr-sub">Pacific Marketplace</div>
    </div>

    <!-- Body card -->
    <div class="card">
      {body_html}
    </div>

    <!-- Footer -->
    <div class="ftr">
      <p>Pacific Culture. All in One Place.</p>
      <p><a href="{SHOP_URL}">{SHOP_URL}</a></p>
    </div>

  </div>
</body>
</html>"""


def send_order_confirmation_email(
    customer_email: str,
    customer_name: str,
    order_id: int,
    total: float,
    items: Optional[list] = None,
    shipping_name: Optional[str] = None,
    shipping_address: Optional[str] = None,
    shipping_city: Optional[str] = None,
    shipping_postcode: Optional[str] = None,
    shipping_country: Optional[str] = None,
    db=None,
    customer_id: Optional[int] = None,
):
    subject = f"Order #{order_id} Confirmed — DA SHOP"

    # ── Item rows ──────────────────────────────────────────────────────────────
    item_rows = ""
    if items:
        for item in items:
            name     = item.get("product_name", item.get("name", ""))
            qty      = item.get("quantity", item.get("qty", 1))
            price    = float(item.get("price", 0))
            variant  = item.get("variant") or ""
            size     = item.get("size") or ""
            meta_parts = []
            if variant: meta_parts.append(f"COLOR {variant.upper()}")
            if size:    meta_parts.append(f"SIZE {size}")
            meta = " · ".join(meta_parts)
            item_rows += f"""
          <tr>
            <td>
              <div class="item-name">{name}</div>
              {"<div class='item-meta'>" + meta + "</div>" if meta else ""}
            </td>
            <td class="mono right">×{qty}</td>
            <td class="mono right">${price * qty:.2f}</td>
          </tr>"""

    items_table = ""
    if item_rows:
        items_table = f"""
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align:right;">Qty</th>
          <th style="text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>{item_rows}</tbody>
    </table>"""

    # ── Shipping block ─────────────────────────────────────────────────────────
    ship_lines = [l for l in [
        shipping_name, shipping_address,
        f"{shipping_city} {shipping_postcode}".strip() if (shipping_city or shipping_postcode) else None,
        shipping_country,
    ] if l]
    ship_html = ""
    if ship_lines:
        addr_rows = "".join(f"<tr><td>{l}</td></tr>" for l in ship_lines)
        ship_html = f"""
    <hr class="rule"/>
    <p class="eyebrow">Ships To</p>
    <table style="margin:0;">
      <tbody>{addr_rows}</tbody>
    </table>"""

    body_html = f"""
    <p class="eyebrow">Order #{order_id}</p>
    <h1 class="headline">ORDER<br/>CONFIRMED.</h1>
    <p class="body-txt">
      Hey {customer_name}, your order is confirmed and being prepared.
      We'll send you a shipping update as soon as it's on its way.
    </p>

    {items_table}

    <hr class="rule-ink"/>
    <div>
      <span class="total-lbl">Total Charged</span><br/>
      <span class="total-val">${total:.2f}</span>
    </div>

    {ship_html}

    <div class="btn-wrap">
      <a class="btn" href="{SHOP_URL}">KEEP SHOPPING &nbsp;→</a>
    </div>

    <hr class="rule" style="margin-top:36px;"/>
    <p style="font-family:'Courier New',Courier,monospace;font-size:10px;
              letter-spacing:0.08em;text-transform:uppercase;color:#6b6b6b;margin:0;">
      Questions? Reply to this email or visit {SHOP_URL}/support
    </p>
"""
    send_email(
        to=customer_email,
        subject=subject,
        html=_base_html(subject, body_html),
        template="order_confirmation",
        db=db,
        order_id=order_id,
        customer_id=customer_id,
    )


def send_cart_abandonment_email(
    customer_email: str,
    customer_name: str,
    cart_items: list,
    db=None,
    customer_id: Optional[int] = None,
):
    subject = "Your DA SHOP cart is waiting"

    rows = "<table><tr><th>Item</th><th>Qty</th><th>Subtotal</th></tr>"
    for item in cart_items:
        subtotal = float(item.get("price", 0)) * int(item.get("qty", 1))
        rows += (
            f"<tr><td>{item.get('name', '')}</td>"
            f"<td>×{item.get('qty', 1)}</td>"
            f"<td>${subtotal:.2f}</td></tr>"
        )
    rows += "</table>"

    body_html = f"""
<h2>Your cart is waiting</h2>
<p>Hey {customer_name}, you left some great items behind.</p>
{rows}
<a class="btn" href="{SHOP_URL}/cart">Complete Your Order</a>
"""
    send_email(
        to=customer_email,
        subject=subject,
        html=_base_html(subject, body_html),
        template="cart_abandonment",
        db=db,
        customer_id=customer_id,
    )


def send_cart_abandonment_sms(
    phone: str,
    customer_name: str,
    db=None,
    customer_id: Optional[int] = None,
):
    send_sms(
        to=phone,
        message=(
            f"Hey {customer_name}, you left items in your DA SHOP cart. "
            f"Complete your order: {SHOP_URL}/cart"
        ),
        template="cart_abandonment",
        db=db,
        customer_id=customer_id,
    )
