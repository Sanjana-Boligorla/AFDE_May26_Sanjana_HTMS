"""
main.py — FastAPI application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import tickets, analytics

# ── Create all tables on startup (if they don't exist) ───────────────────────
Base.metadata.create_all(bind=engine)

# ── App instance ──────────────────────────────────────────────────────────────
app = FastAPI(
    title       = "Helpdesk Ticket Management System",
    description = "REST API for managing internal IT support tickets.",
    version     = "2.0.0",
    docs_url    = "/docs",
    redoc_url   = "/redoc",
)

# ── CORS middleware ───────────────────────────────────────────────────────────
# Allow the React dev server (port 5173) and any localhost origin
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(tickets.router)
app.include_router(analytics.router)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Helpdesk API is running 🚀"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
