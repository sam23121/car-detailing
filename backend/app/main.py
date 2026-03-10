import os
import logging
import threading
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import engine, get_db, Base

logger = logging.getLogger(__name__)
from app import models  # noqa: F401 - register models with Base
from app.routers import services, bookings, reviews, contact, blog, business, customers, availability, packages

_LAMBDA_TABLES_LOCK = threading.Lock()
_LAMBDA_TABLES_ENSURED = False


def _ensure_lambda_tables():
    """Run once on first request when on Lambda so tables exist without blocking init."""
    global _LAMBDA_TABLES_ENSURED
    if not os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
        return
    with _LAMBDA_TABLES_LOCK:
        if _LAMBDA_TABLES_ENSURED:
            return
        try:
            Base.metadata.create_all(bind=engine)
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS location VARCHAR(500)"))
                for stmt in [
                    "ALTER TABLE packages ADD COLUMN IF NOT EXISTS price_small FLOAT",
                    "ALTER TABLE packages ADD COLUMN IF NOT EXISTS price_medium FLOAT",
                    "ALTER TABLE packages ADD COLUMN IF NOT EXISTS price_large FLOAT",
                    "ALTER TABLE packages ADD COLUMN IF NOT EXISTS price_original_small FLOAT",
                    "ALTER TABLE packages ADD COLUMN IF NOT EXISTS price_original_medium FLOAT",
                    "ALTER TABLE packages ADD COLUMN IF NOT EXISTS price_original_large FLOAT",
                    "ALTER TABLE packages ADD COLUMN IF NOT EXISTS turnaround_hours INTEGER",
                    "ALTER TABLE packages ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)",
                    "ALTER TABLE packages ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0",
                ]:
                    try:
                        conn.execute(text(stmt))
                    except Exception:
                        pass
            _LAMBDA_TABLES_ENSURED = True
            logger.info("Lambda: tables ensured on first request")
        except Exception as e:
            logger.exception("Lambda: failed to ensure tables: %s", e)


# Skip DB init when running on Lambda (run migrations/seed separately; keeps cold start fast)
if not os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
    # Create tables
    Base.metadata.create_all(bind=engine)

    # One-off migration: add booking.location if missing (create_all does not add new columns)
    try:
        from sqlalchemy import text
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS location VARCHAR(500)"))
    except Exception:
        pass

    # One-off migration: add package tiered pricing and display fields
    try:
        from sqlalchemy import text
        with engine.begin() as conn:
            for stmt in [
                "ALTER TABLE packages ADD COLUMN IF NOT EXISTS price_small FLOAT",
                "ALTER TABLE packages ADD COLUMN IF NOT EXISTS price_medium FLOAT",
                "ALTER TABLE packages ADD COLUMN IF NOT EXISTS price_large FLOAT",
                "ALTER TABLE packages ADD COLUMN IF NOT EXISTS price_original_small FLOAT",
                "ALTER TABLE packages ADD COLUMN IF NOT EXISTS price_original_medium FLOAT",
                "ALTER TABLE packages ADD COLUMN IF NOT EXISTS price_original_large FLOAT",
                "ALTER TABLE packages ADD COLUMN IF NOT EXISTS turnaround_hours INTEGER",
                "ALTER TABLE packages ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)",
                "ALTER TABLE packages ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0",
            ]:
                try:
                    conn.execute(text(stmt))
                except Exception:
                    pass
    except Exception:
        pass

    # Seed default services/packages on startup (e.g. for Render free tier with no Shell).
    # Set RUN_SEED_ON_STARTUP=false in env to disable.
    if os.getenv("RUN_SEED_ON_STARTUP", "true").lower() != "false":
        try:
            from app.seed import run_seed
            run_seed()
        except Exception as e:
            import logging
            logging.getLogger("app.main").warning("Startup seed skipped or failed: %s", e)

# Explicit server URL for Swagger "Try it out" so request URL is always https (avoids "Failed to fetch" / URL scheme errors)
lambda_url = os.getenv("LAMBDA_FUNCTION_URL", "")  # set this env var in Lambda config


app = FastAPI(
    title="Quality Mobile Detailing API",
    description="API for Quality Mobile Detailing Service",
    version="1.0.0",
    redirect_slashes=False,
    servers=[{"url": lambda_url or "/", "description": "This host"}],
)

origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    "https://car-detailing-tau.vercel.app",
    "https://car-detailing.pages.dev/",
    "https://volqtxhodt65quinnqcfcmcogy0txfcp.lambda-url.us-east-1.on.aws",
    "https://ymbdetailing.com/",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(customers.router, prefix="/api/customers", tags=["Customers"])
app.include_router(services.router, prefix="/api/services", tags=["Services"])
app.include_router(packages.router, prefix="/api/packages", tags=["Packages"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["Reviews"])
app.include_router(contact.router, prefix="/api/contact", tags=["Contact"])
app.include_router(blog.router, prefix="/api/blog", tags=["Blog"])
app.include_router(business.router, prefix="/api/business", tags=["Business"])
app.include_router(availability.router, prefix="/api/availability", tags=["Availability"])


@app.exception_handler(Exception)
def unhandled_exception_handler(request: Request, exc: Exception):
    """Log full traceback and return error detail so Lambda 500s are debuggable."""
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "type": type(exc).__name__},
    )


@app.get("/")
def read_root():
    return {"message": "Welcome to Quality Mobile Detailing API"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Returns app and DB status; on Lambda use this to verify DATABASE_URL and tables."""
    out = {"status": "healthy"}
    if os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
        try:
            db.execute(text("SELECT 1"))
            out["db"] = "ok"
        except Exception as e:
            logger.exception("Health check DB failed: %s", e)
            out["db"] = "error"
            out["db_detail"] = str(e)
    return out

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
