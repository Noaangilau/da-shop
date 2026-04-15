from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from database import engine, Base

# Register all models so SQLAlchemy creates every table
import models.vendor_inquiry  # noqa: F401
import models.customer        # noqa: F401
import models.order           # noqa: F401

from routers import vendor_inquiry, auth, customers, orders, ai_chat, admin

load_dotenv()

Base.metadata.create_all(bind=engine)

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


@app.get("/health")
def health():
    return {"status": "ok", "project": "DA SHOP"}
