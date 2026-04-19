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

from routers import vendor_inquiry, auth, customers, orders, ai_chat, admin, brands, products, payments, announcements

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
    ]
    for sql in migrations:
        try:
            with engine.connect() as conn:
                conn.execute(text(sql))
                conn.commit()
        except Exception as e:
            print(f"  [migration skipped] {sql[:60]}... -> {type(e).__name__}")

_run_migrations()

try:
    from seed_catalog import sync_product_images
    sync_product_images()
except Exception as e:
    print(f"  [startup] sync_product_images skipped: {e}")

app = FastAPI(title="DA SHOP API")

_origins_env = os.getenv("FRONTEND_ORIGIN", "")
_allowed_origins = [o.strip() for o in _origins_env.split(",") if o.strip()] or [
    "http://localhost:5173",
    "https://dashopf-production.up.railway.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_origin_regex=r"https://.*\.up\.railway\.app",
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
app.include_router(announcements.router)


@app.get("/health")
def health():
    return {"status": "ok", "project": "DA SHOP"}
