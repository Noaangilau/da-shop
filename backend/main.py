from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from database import engine, Base

# Register all models so SQLAlchemy creates every table
import models.vendor_inquiry  # noqa: F401
import models.customer        # noqa: F401
import models.order           # noqa: F401
import models.brand             # noqa: F401
import models.product           # noqa: F401
import models.notification_log  # noqa: F401
import models.chat_log           # noqa: F401
import models.announcement       # noqa: F401
import models.tee_template        # noqa: F401

from routers import vendor_inquiry, auth, customers, orders, ai_chat, admin, brands, products, payments, announcements, media, vendor

load_dotenv()

Base.metadata.create_all(bind=engine)


def _run_migrations():
    """Add columns introduced after initial schema creation. Each statement
    runs in its own connection so a failure on one (e.g. column already exists)
    doesn't poison subsequent statements on Postgres."""
    from sqlalchemy import text
    migrations = [
        "ALTER TABLE orders ADD COLUMN payment_intent_id TEXT",
        "ALTER TABLE customers ADD COLUMN role TEXT DEFAULT 'customer'",
        "ALTER TABLE customers ADD COLUMN brand_id INTEGER",
        "UPDATE customers SET role='admin' WHERE is_admin=true",
        "ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE",
        "ALTER TABLE products ADD COLUMN stock_count INTEGER",
        "ALTER TABLE products ADD COLUMN kaikefiu BOOLEAN DEFAULT FALSE",
        "ALTER TABLE products ADD COLUMN variants TEXT",
        "ALTER TABLE order_items ADD COLUMN variant TEXT",
        "ALTER TABLE order_items ADD COLUMN size TEXT",
        "ALTER TABLE orders ADD COLUMN is_guest INTEGER DEFAULT 0",
        "ALTER TABLE orders ALTER COLUMN customer_id DROP NOT NULL",
    ]
    for sql in migrations:
        try:
            with engine.connect() as conn:
                conn.execute(text(sql))
                conn.commit()
        except Exception as e:
            print(f"  [migration skipped] {sql[:60]}... -> {type(e).__name__}")

_run_migrations()


def _ensure_admin():
    admin_email = os.getenv("ADMIN_EMAIL", "").strip().lower()
    admin_password = os.getenv("ADMIN_PASSWORD", "").strip()
    if not admin_email:
        return
    from sqlalchemy import text
    from sqlalchemy.orm import Session
    from models.customer import Customer
    from utils.auth import hash_password
    session = Session(engine)
    try:
        existing = session.query(Customer).filter(Customer.email == admin_email).first()
        if existing:
            if not existing.is_admin:
                existing.is_admin = True
                existing.role = "admin"
                session.commit()
                print(f"  [startup] promoted {admin_email} to admin")
        elif admin_password:
            session.add(Customer(
                email=admin_email,
                password_hash=hash_password(admin_password),
                first_name="Admin",
                last_name="",
                is_admin=True,
                role="admin",
            ))
            session.commit()
            print(f"  [startup] created admin account: {admin_email}")
    except Exception as e:
        print(f"  [startup] admin setup skipped: {e}")
    finally:
        session.close()

_ensure_admin()

try:
    from seed_catalog import sync_product_images
    sync_product_images()
except Exception as e:
    print(f"  [startup] sync_product_images skipped: {e}")

app = FastAPI(title="DA SHOP API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vendor_inquiry.router)
app.include_router(auth.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(ai_chat.router)
app.include_router(admin.router)
app.include_router(brands.router)
app.include_router(products.router)
app.include_router(payments.router)
app.include_router(announcements.router)
app.include_router(media.router)
app.include_router(vendor.router)


@app.get("/health")
def health():
    return {"status": "ok", "project": "DA SHOP"}
