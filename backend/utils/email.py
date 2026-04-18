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
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>{title}</title>
  <style>
    body  {{ font-family: Arial, sans-serif; background:#f7f7f7; margin:0; padding:0; color:#111; }}
    .wrap {{ max-width:580px; margin:32px auto; background:#fff; border:1px solid #e5e5e5; }}
    .hdr  {{ background:#111; padding:24px 32px; }}
    .hdr h1 {{ color:#fff; font-size:18px; letter-spacing:0.12em; text-transform:uppercase; margin:0; }}
    .body {{ padding:32px; font-size:14px; line-height:1.7; color:#444; }}
    .body h2 {{ color:#111; font-size:16px; text-transform:uppercase; letter-spacing:0.08em; margin-top:0; }}
    .total {{ font-size:22px; font-weight:900; color:#111; margin:16px 0; }}
    .btn  {{ display:inline-block; background:#111; color:#fff; padding:14px 32px;
             text-decoration:none; font-size:11px; letter-spacing:0.12em;
             text-transform:uppercase; font-weight:700; margin-top:8px; }}
    .ftr  {{ padding:20px 32px; border-top:1px solid #e5e5e5; font-size:11px;
             color:#888; text-align:center; }}
    table {{ width:100%; border-collapse:collapse; margin:16px 0; }}
    td,th {{ padding:8px 0; border-bottom:1px solid #f0f0f0; font-size:13px; text-align:left; }}
    th    {{ font-size:10px; text-transform:uppercase; letter-spacing:0.1em; color:#888; }}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr"><h1>{SHOP_NAME}</h1></div>
    <div class="body">{body_html}</div>
    <div class="ftr">Pacific Culture. All in One Place.<br/>
      <a href="{SHOP_URL}" style="color:#888;">{SHOP_URL}</a>
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
    db=None,
    customer_id: Optional[int] = None,
):
    subject = f"Order #{order_id} confirmed — {SHOP_NAME}"

    rows = ""
    if items:
        rows = "<table><tr><th>Item</th><th>Qty</th><th>Price</th></tr>"
        for item in items:
            rows += (
                f"<tr><td>{item.get('product_name', item.get('name', ''))}</td>"
                f"<td>×{item.get('quantity', item.get('qty', 1))}</td>"
                f"<td>${float(item.get('price', 0)):.2f}</td></tr>"
            )
        rows += "</table>"

    body_html = f"""
<h2>Order Confirmed</h2>
<p>Hey {customer_name}, your order is confirmed and being prepared.</p>
{rows}
<p class="total">Total: ${total:.2f}</p>
<p>We'll send you a shipping update as soon as your order is on its way.<br/>
Thanks for supporting Pacific vendors.</p>
<a class="btn" href="{SHOP_URL}">Keep Shopping</a>
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
