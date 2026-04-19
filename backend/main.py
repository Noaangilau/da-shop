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

from routers import vendor_inquiry, auth, customers, orders, ai_chat, admin, brands, products, payments

load_dotenv()

Base.metadata.create_all(bind=engine)


def _run_migrations():
    """Add columns introduced after initial schema creation (SQLite ALTER TABLE)."""
    from sqlalchemy import text
    migrations = [
        "ALTER TABLE orders ADD COLUMN payment_intent_id TEXT",
    ]
    with engine.connect() as conn:
        for sql in migrations:
            try:
                conn.execute(text(sql))
                conn.commit()
            except Exception:
                pass  # Column already exists

_run_migrations()

try:
    from seed_catalog import sync_product_images
    sync_product_images()
except Exception as e:
    print(f"  [startup] sync_product_images skipped: {e}")

app = FastAPI(title="DA SHOP API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")],
    allow_credentials=True,
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


@app.get("/health")
def health():
    return {"status": "ok", "project": "DA SHOP"}
