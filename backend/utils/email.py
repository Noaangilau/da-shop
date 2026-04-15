"""
Email + SMS notification utilities.

Currently logs to console for development.

To wire up Resend (email):
  pip install resend
  Set RESEND_API_KEY in Railway env vars.
  Replace the send_email body with:
    import resend
    resend.api_key = os.getenv("RESEND_API_KEY")
    resend.Emails.send({"from": "noreply@dashop.co.nz", "to": to, "subject": subject, "html": body})

To wire up Twilio (SMS):
  pip install twilio
  Set TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM in Railway env vars.
  Replace the send_sms body with:
    from twilio.rest import Client
    client = Client(os.getenv("TWILIO_SID"), os.getenv("TWILIO_TOKEN"))
    client.messages.create(body=message, from_=os.getenv("TWILIO_FROM"), to=to)
"""

import logging

logger = logging.getLogger(__name__)
SHOP_URL = "https://da-shop-back-production.up.railway.app"


def send_email(to: str, subject: str, body: str):
    logger.info(f"[EMAIL] To: {to} | Subject: {subject}")
    print(f"\n--- EMAIL ---")
    print(f"To:      {to}")
    print(f"Subject: {subject}")
    print(body)
    print("--- END EMAIL ---\n")


def send_sms(to: str, message: str):
    logger.info(f"[SMS] To: {to}")
    print(f"\n--- SMS ---")
    print(f"To: {to}")
    print(message)
    print("--- END SMS ---\n")


def send_cart_abandonment_email(customer_email: str, customer_name: str, cart_items: list):
    lines = "\n".join(
        f"  • {item['name']} ×{item['qty']} — ${float(item['price']) * int(item['qty']):.2f}"
        for item in cart_items
    )
    body = f"""Hi {customer_name},

You left some great items in your DA SHOP cart:

{lines}

Your cart is saved and ready when you are.
Complete your order → {SHOP_URL}/cart

— DA SHOP
Pacific Culture. All in One Place.
"""
    send_email(
        to=customer_email,
        subject="Your DA SHOP cart is waiting",
        body=body,
    )


def send_cart_abandonment_sms(phone: str, customer_name: str):
    send_sms(
        to=phone,
        message=(
            f"Hey {customer_name}, you left items in your DA SHOP cart. "
            f"Complete your order: {SHOP_URL}/cart"
        ),
    )


def send_order_confirmation_email(customer_email: str, customer_name: str, order_id: int, total: float):
    body = f"""Hi {customer_name},

Your order #{order_id} has been confirmed.

Total: ${total:.2f}

We'll be in touch with shipping updates. Thanks for supporting Pacific vendors.

— DA SHOP
Pacific Culture. All in One Place.
"""
    send_email(
        to=customer_email,
        subject=f"Order #{order_id} confirmed — DA SHOP",
        body=body,
    )
