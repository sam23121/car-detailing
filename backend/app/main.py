import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, get_db, Base
from app import models
from app.routers import services, bookings, reviews, contact, blog, business, customers

# Create tables
Base.metadata.create_all(bind=engine)

# Seed default services/packages on startup (e.g. for Render free tier with no Shell).
# Set RUN_SEED_ON_STARTUP=false in env to disable.
if os.getenv("RUN_SEED_ON_STARTUP", "true").lower() != "false":
    try:
        from app.seed import run_seed
        run_seed()
    except Exception as e:
        # Log but don't crash the app if DB isn't ready or seed fails
        import logging
        logging.getLogger("app.main").warning("Startup seed skipped or failed: %s", e)

app = FastAPI(
    title="Quality Mobile Detailing API",
    description="API for Quality Mobile Detailing Service",
    version="1.0.0"
)

origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    "https://car-detailing-tau.vercel.app",
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
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["Reviews"])
app.include_router(contact.router, prefix="/api/contact", tags=["Contact"])
app.include_router(blog.router, prefix="/api/blog", tags=["Blog"])
app.include_router(business.router, prefix="/api/business", tags=["Business"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Quality Mobile Detailing API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
