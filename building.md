# Quality Mobile Detailing Website - Full Build Guide
## FastAPI Backend + PostgreSQL + React Frontend

---

## Project Overview

This guide provides step-by-step instructions to build an exact replica of the Quality Mobile Detailing website using:
- **Backend**: FastAPI + Python
- **Database**: PostgreSQL
- **Frontend**: React + HTML/CSS
- **Deployment**: Docker (optional)

The website includes a professional detailing service platform with service packages, booking system, customer reviews, and admin management.

---

## Table of Contents

1. [Prerequisites & Environment Setup](#prerequisites--environment-setup)
2. [Database Design & Setup](#database-design--setup)
3. [Backend Setup (FastAPI)](#backend-setup-fastapi)
4. [API Endpoints](#api-endpoints)
5. [Frontend Setup (React)](#frontend-setup-react)
6. [Styling & Design](#styling--design)
7. [Deployment](#deployment)
8. [Testing & Verification](#testing--verification)

---

## Prerequisites & Environment Setup

### Required Tools

Install the following on your system:
- Python 3.9+ (download from python.org)
- Node.js 16+ (download from nodejs.org)
- PostgreSQL 13+ (download from postgresql.org)
- Git (download from git-scm.com)
- Docker (optional, for containerization)

### Create Project Directory

```bash
mkdir quality-detailing
cd quality-detailing
mkdir backend frontend
```

### Set Up Python Virtual Environment

Navigate to the backend directory and create a virtual environment:

```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### Install Python Dependencies

Create a `requirements.txt` file with the following dependencies:

```text
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.5.0
python-dotenv==1.0.0
python-multipart==0.0.6
email-validator==2.1.0
passlib==1.7.4
python-jose==3.3.0
cors==1.0.1
```

Install them:

```bash
pip install -r requirements.txt
```

---

## Database Design & Setup

### PostgreSQL Database Setup

Open PostgreSQL and create the database:

```sql
CREATE DATABASE quality_detailing_db;

-- Connect to the database
\c quality_detailing_db
```

### Create Database Tables

Execute these SQL commands to set up the database schema:

```sql
-- Users/Customers Table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services Table
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service Packages Table
CREATE TABLE packages (
    id SERIAL PRIMARY KEY,
    service_id INTEGER NOT NULL REFERENCES services(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    duration_minutes INTEGER,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings/Appointments Table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    package_id INTEGER NOT NULL REFERENCES packages(id),
    scheduled_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews Table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    service_id INTEGER REFERENCES services(id),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact Messages Table
CREATE TABLE contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blog Posts Table
CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(500),
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business Information Table
CREATE TABLE business_info (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20),
    email VARCHAR(255),
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    hours_open VARCHAR(100),
    hours_close VARCHAR(100),
    service_areas TEXT, -- Comma-separated states/regions
    business_hours_monday_open VARCHAR(10),
    business_hours_monday_close VARCHAR(10),
    business_hours_sunday_open VARCHAR(10),
    business_hours_sunday_close VARCHAR(10)
);

-- FAQ Table
CREATE TABLE faqs (
    id SERIAL PRIMARY KEY,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Backend Setup (FastAPI)

### Project Structure

Create the following directory structure in the backend folder:

```
backend/
├── venv/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── services.py
│   │   ├── bookings.py
│   │   ├── reviews.py
│   │   ├── contact.py
│   │   ├── blog.py
│   │   └── business.py
│   └── crud/
│       ├── __init__.py
│       ├── customers.py
│       ├── services.py
│       ├── bookings.py
│       └── reviews.py
├── .env
└── requirements.txt
```

### Environment Variables (.env)

Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/quality_detailing_db
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=["http://localhost:3000", "http://localhost:8000"]
```

Replace `username` and `password` with your PostgreSQL credentials.

### Database Connection (database.py)

Create `app/database.py`:

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Database Models (models.py)

Create `app/models.py`:

```python
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    bookings = relationship("Booking", back_populates="customer")
    reviews = relationship("Review", back_populates="customer")

class Service(Base):
    __tablename__ = "services"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    description = Column(Text)
    image_url = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    packages = relationship("Package", back_populates="service")
    reviews = relationship("Review", back_populates="service")

class Package(Base):
    __tablename__ = "packages"
    
    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    price = Column(Float)
    duration_minutes = Column(Integer)
    details = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    service = relationship("Service", back_populates="packages")
    bookings = relationship("Booking", back_populates="package")

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    package_id = Column(Integer, ForeignKey("packages.id"), nullable=False)
    scheduled_date = Column(DateTime, nullable=False)
    status = Column(String(50), default="pending")
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    customer = relationship("Customer", back_populates="bookings")
    package = relationship("Package", back_populates="bookings")

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"))
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    customer = relationship("Customer", back_populates="reviews")
    service = relationship("Service", back_populates="reviews")

class ContactMessage(Base):
    __tablename__ = "contact_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20))
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class BlogPost(Base):
    __tablename__ = "blog_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    slug = Column(String(500), unique=True, nullable=False)
    content = Column(Text, nullable=False)
    image_url = Column(String(500))
    published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class BusinessInfo(Base):
    __tablename__ = "business_info"
    
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(20))
    email = Column(String(255))
    address = Column(String(500))
    city = Column(String(100))
    state = Column(String(50))
    zip_code = Column(String(10))
    service_areas = Column(Text)
    business_hours_monday_open = Column(String(10))
    business_hours_monday_close = Column(String(10))
    business_hours_sunday_open = Column(String(10))
    business_hours_sunday_close = Column(String(10))

class FAQ(Base):
    __tablename__ = "faqs"
    
    id = Column(Integer, primary_key=True, index=True)
    question = Column(String(500), nullable=False)
    answer = Column(Text, nullable=False)
    order_index = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
```

### Pydantic Schemas (schemas.py)

Create `app/schemas.py` for request/response validation:

```python
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# Customer Schemas
class CustomerBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Service Schemas
class ServiceBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class ServiceCreate(ServiceBase):
    pass

class Service(ServiceBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Package Schemas
class PackageBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Optional[float] = None
    duration_minutes: Optional[int] = None
    details: Optional[str] = None

class PackageCreate(PackageBase):
    service_id: int

class Package(PackageBase):
    id: int
    service_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Booking Schemas
class BookingBase(BaseModel):
    scheduled_date: datetime
    status: str = "pending"
    notes: Optional[str] = None

class BookingCreate(BookingBase):
    customer_id: int
    package_id: int

class Booking(BookingBase):
    id: int
    customer_id: int
    package_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Review Schemas
class ReviewBase(BaseModel):
    rating: int
    comment: str
    service_id: Optional[int] = None

class ReviewCreate(ReviewBase):
    customer_id: int

class Review(ReviewBase):
    id: int
    customer_id: int
    verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Contact Message Schemas
class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str

class ContactMessage(ContactMessageCreate):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Business Info Schemas
class BusinessInfoCreate(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    service_areas: Optional[str] = None

class BusinessInfo(BusinessInfoCreate):
    id: int
    
    class Config:
        from_attributes = True

# FAQ Schemas
class FAQCreate(BaseModel):
    question: str
    answer: str
    order_index: Optional[int] = None

class FAQ(FAQCreate):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Blog Post Schemas
class BlogPostCreate(BaseModel):
    title: str
    slug: str
    content: str
    image_url: Optional[str] = None
    published: bool = False

class BlogPost(BlogPostCreate):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
```

### CRUD Operations

Create `app/crud/customers.py`:

```python
from sqlalchemy.orm import Session
from app import models, schemas

def create_customer(db: Session, customer: schemas.CustomerCreate):
    db_customer = models.Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def get_customer(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def get_customer_by_email(db: Session, email: str):
    return db.query(models.Customer).filter(models.Customer.email == email).first()

def get_customers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Customer).offset(skip).limit(limit).all()

def update_customer(db: Session, customer_id: int, customer: schemas.CustomerCreate):
    db_customer = get_customer(db, customer_id)
    if db_customer:
        for key, value in customer.dict().items():
            setattr(db_customer, key, value)
        db.commit()
        db.refresh(db_customer)
    return db_customer

def delete_customer(db: Session, customer_id: int):
    db_customer = get_customer(db, customer_id)
    if db_customer:
        db.delete(db_customer)
        db.commit()
    return db_customer
```

Create `app/crud/services.py`:

```python
from sqlalchemy.orm import Session
from app import models, schemas

def create_service(db: Session, service: schemas.ServiceCreate):
    db_service = models.Service(**service.dict())
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

def get_service(db: Session, service_id: int):
    return db.query(models.Service).filter(models.Service.id == service_id).first()

def get_service_by_slug(db: Session, slug: str):
    return db.query(models.Service).filter(models.Service.slug == slug).first()

def get_services(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Service).offset(skip).limit(limit).all()

def update_service(db: Session, service_id: int, service: schemas.ServiceCreate):
    db_service = get_service(db, service_id)
    if db_service:
        for key, value in service.dict().items():
            setattr(db_service, key, value)
        db.commit()
        db.refresh(db_service)
    return db_service

def delete_service(db: Session, service_id: int):
    db_service = get_service(db, service_id)
    if db_service:
        db.delete(db_service)
        db.commit()
    return db_service

def get_service_packages(db: Session, service_id: int):
    return db.query(models.Package).filter(models.Package.service_id == service_id).all()
```

Create `app/crud/bookings.py`:

```python
from sqlalchemy.orm import Session
from app import models, schemas
from datetime import datetime

def create_booking(db: Session, booking: schemas.BookingCreate):
    db_booking = models.Booking(**booking.dict())
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

def get_booking(db: Session, booking_id: int):
    return db.query(models.Booking).filter(models.Booking.id == booking_id).first()

def get_bookings(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Booking).offset(skip).limit(limit).all()

def get_customer_bookings(db: Session, customer_id: int):
    return db.query(models.Booking).filter(models.Booking.customer_id == customer_id).all()

def update_booking(db: Session, booking_id: int, booking: schemas.BookingCreate):
    db_booking = get_booking(db, booking_id)
    if db_booking:
        for key, value in booking.dict().items():
            setattr(db_booking, key, value)
        db_booking.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_booking)
    return db_booking

def delete_booking(db: Session, booking_id: int):
    db_booking = get_booking(db, booking_id)
    if db_booking:
        db.delete(db_booking)
        db.commit()
    return db_booking
```

Create `app/crud/reviews.py`:

```python
from sqlalchemy.orm import Session
from app import models, schemas

def create_review(db: Session, review: schemas.ReviewCreate):
    db_review = models.Review(**review.dict())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def get_review(db: Session, review_id: int):
    return db.query(models.Review).filter(models.Review.id == review_id).first()

def get_reviews(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Review).offset(skip).limit(limit).all()

def get_service_reviews(db: Session, service_id: int):
    return db.query(models.Review).filter(models.Review.service_id == service_id).all()

def get_verified_reviews(db: Session, limit: int = 10):
    return db.query(models.Review).filter(models.Review.verified == True).order_by(models.Review.created_at.desc()).limit(limit).all()

def update_review(db: Session, review_id: int, review: schemas.ReviewCreate):
    db_review = get_review(db, review_id)
    if db_review:
        for key, value in review.dict().items():
            setattr(db_review, key, value)
        db.commit()
        db.refresh(db_review)
    return db_review

def delete_review(db: Session, review_id: int):
    db_review = get_review(db, review_id)
    if db_review:
        db.delete(db_review)
        db.commit()
    return db_review
```

---

## API Endpoints

### Main Application (main.py)

Create `app/main.py`:

```python
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os

from app.database import engine, get_db, Base
from app import models
from app.routers import services, bookings, reviews, contact, blog, business

load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Quality Mobile Detailing API",
    description="API for Quality Mobile Detailing Service",
    version="1.0.0"
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
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
```

### Services Router (routers/services.py)

Create `app/routers/services.py`:

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas, crud
from app.crud import services as crud_services

router = APIRouter()

@router.post("/", response_model=schemas.Service)
def create_service(service: schemas.ServiceCreate, db: Session = Depends(get_db)):
    return crud_services.create_service(db=db, service=service)

@router.get("/", response_model=list[schemas.Service])
def list_services(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_services.get_services(db, skip=skip, limit=limit)

@router.get("/{service_id}", response_model=schemas.Service)
def get_service(service_id: int, db: Session = Depends(get_db)):
    db_service = crud_services.get_service(db, service_id=service_id)
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")
    return db_service

@router.get("/slug/{slug}", response_model=schemas.Service)
def get_service_by_slug(slug: str, db: Session = Depends(get_db)):
    db_service = crud_services.get_service_by_slug(db, slug=slug)
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")
    return db_service

@router.put("/{service_id}", response_model=schemas.Service)
def update_service(service_id: int, service: schemas.ServiceCreate, db: Session = Depends(get_db)):
    db_service = crud_services.update_service(db=db, service_id=service_id, service=service)
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")
    return db_service

@router.delete("/{service_id}", response_model=schemas.Service)
def delete_service(service_id: int, db: Session = Depends(get_db)):
    db_service = crud_services.delete_service(db=db, service_id=service_id)
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")
    return db_service

@router.get("/{service_id}/packages", response_model=list[schemas.Package])
def get_service_packages(service_id: int, db: Session = Depends(get_db)):
    packages = crud_services.get_service_packages(db, service_id=service_id)
    if not packages:
        raise HTTPException(status_code=404, detail="No packages found for this service")
    return packages
```

### Bookings Router (routers/bookings.py)

Create `app/routers/bookings.py`:

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas
from app.crud import bookings as crud_bookings

router = APIRouter()

@router.post("/", response_model=schemas.Booking)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    return crud_bookings.create_booking(db=db, booking=booking)

@router.get("/", response_model=list[schemas.Booking])
def list_bookings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_bookings.get_bookings(db, skip=skip, limit=limit)

@router.get("/{booking_id}", response_model=schemas.Booking)
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    db_booking = crud_bookings.get_booking(db, booking_id=booking_id)
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return db_booking

@router.get("/customer/{customer_id}", response_model=list[schemas.Booking])
def get_customer_bookings(customer_id: int, db: Session = Depends(get_db)):
    bookings = crud_bookings.get_customer_bookings(db, customer_id=customer_id)
    return bookings

@router.put("/{booking_id}", response_model=schemas.Booking)
def update_booking(booking_id: int, booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    db_booking = crud_bookings.update_booking(db=db, booking_id=booking_id, booking=booking)
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return db_booking

@router.delete("/{booking_id}", response_model=schemas.Booking)
def delete_booking(booking_id: int, db: Session = Depends(get_db)):
    db_booking = crud_bookings.delete_booking(db=db, booking_id=booking_id)
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return db_booking
```

### Reviews Router (routers/reviews.py)

Create `app/routers/reviews.py`:

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas
from app.crud import reviews as crud_reviews

router = APIRouter()

@router.post("/", response_model=schemas.Review)
def create_review(review: schemas.ReviewCreate, db: Session = Depends(get_db)):
    return crud_reviews.create_review(db=db, review=review)

@router.get("/", response_model=list[schemas.Review])
def list_reviews(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_reviews.get_reviews(db, skip=skip, limit=limit)

@router.get("/verified", response_model=list[schemas.Review])
def get_verified_reviews(limit: int = 10, db: Session = Depends(get_db)):
    return crud_reviews.get_verified_reviews(db, limit=limit)

@router.get("/{review_id}", response_model=schemas.Review)
def get_review(review_id: int, db: Session = Depends(get_db)):
    db_review = crud_reviews.get_review(db, review_id=review_id)
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    return db_review

@router.get("/service/{service_id}", response_model=list[schemas.Review])
def get_service_reviews(service_id: int, db: Session = Depends(get_db)):
    return crud_reviews.get_service_reviews(db, service_id=service_id)

@router.put("/{review_id}", response_model=schemas.Review)
def update_review(review_id: int, review: schemas.ReviewCreate, db: Session = Depends(get_db)):
    db_review = crud_reviews.update_review(db=db, review_id=review_id, review=review)
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    return db_review

@router.delete("/{review_id}", response_model=schemas.Review)
def delete_review(review_id: int, db: Session = Depends(get_db)):
    db_review = crud_reviews.delete_review(db=db, review_id=review_id)
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    return db_review
```

### Contact Router (routers/contact.py)

Create `app/routers/contact.py`:

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter()

@router.post("/", response_model=schemas.ContactMessage)
def create_contact_message(message: schemas.ContactMessageCreate, db: Session = Depends(get_db)):
    db_message = models.ContactMessage(**message.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@router.get("/", response_model=list[schemas.ContactMessage])
def list_contact_messages(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.ContactMessage).offset(skip).limit(limit).all()

@router.get("/{message_id}", response_model=schemas.ContactMessage)
def get_contact_message(message_id: int, db: Session = Depends(get_db)):
    db_message = db.query(models.ContactMessage).filter(models.ContactMessage.id == message_id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found")
    return db_message

@router.delete("/{message_id}")
def delete_contact_message(message_id: int, db: Session = Depends(get_db)):
    db_message = db.query(models.ContactMessage).filter(models.ContactMessage.id == message_id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found")
    db.delete(db_message)
    db.commit()
    return {"message": "Message deleted successfully"}
```

### Blog Router (routers/blog.py)

Create `app/routers/blog.py`:

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter()

@router.post("/", response_model=schemas.BlogPost)
def create_blog_post(post: schemas.BlogPostCreate, db: Session = Depends(get_db)):
    db_post = models.BlogPost(**post.dict())
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@router.get("/", response_model=list[schemas.BlogPost])
def list_blog_posts(skip: int = 0, limit: int = 100, published_only: bool = True, db: Session = Depends(get_db)):
    query = db.query(models.BlogPost)
    if published_only:
        query = query.filter(models.BlogPost.published == True)
    return query.offset(skip).limit(limit).all()

@router.get("/{post_id}", response_model=schemas.BlogPost)
def get_blog_post(post_id: int, db: Session = Depends(get_db)):
    db_post = db.query(models.BlogPost).filter(models.BlogPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return db_post

@router.get("/slug/{slug}", response_model=schemas.BlogPost)
def get_blog_post_by_slug(slug: str, db: Session = Depends(get_db)):
    db_post = db.query(models.BlogPost).filter(models.BlogPost.slug == slug).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return db_post

@router.put("/{post_id}", response_model=schemas.BlogPost)
def update_blog_post(post_id: int, post: schemas.BlogPostCreate, db: Session = Depends(get_db)):
    db_post = db.query(models.BlogPost).filter(models.BlogPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    for key, value in post.dict().items():
        setattr(db_post, key, value)
    db.commit()
    db.refresh(db_post)
    return db_post

@router.delete("/{post_id}")
def delete_blog_post(post_id: int, db: Session = Depends(get_db)):
    db_post = db.query(models.BlogPost).filter(models.BlogPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    db.delete(db_post)
    db.commit()
    return {"message": "Blog post deleted successfully"}
```

### Business Router (routers/business.py)

Create `app/routers/business.py`:

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter()

@router.post("/info", response_model=schemas.BusinessInfo)
def create_business_info(info: schemas.BusinessInfoCreate, db: Session = Depends(get_db)):
    db_info = models.BusinessInfo(**info.dict())
    db.add(db_info)
    db.commit()
    db.refresh(db_info)
    return db_info

@router.get("/info", response_model=schemas.BusinessInfo)
def get_business_info(db: Session = Depends(get_db)):
    db_info = db.query(models.BusinessInfo).first()
    if not db_info:
        raise HTTPException(status_code=404, detail="Business info not found")
    return db_info

@router.put("/info/{info_id}", response_model=schemas.BusinessInfo)
def update_business_info(info_id: int, info: schemas.BusinessInfoCreate, db: Session = Depends(get_db)):
    db_info = db.query(models.BusinessInfo).filter(models.BusinessInfo.id == info_id).first()
    if not db_info:
        raise HTTPException(status_code=404, detail="Business info not found")
    for key, value in info.dict().items():
        setattr(db_info, key, value)
    db.commit()
    db.refresh(db_info)
    return db_info

@router.post("/faq", response_model=schemas.FAQ)
def create_faq(faq: schemas.FAQCreate, db: Session = Depends(get_db)):
    db_faq = models.FAQ(**faq.dict())
    db.add(db_faq)
    db.commit()
    db.refresh(db_faq)
    return db_faq

@router.get("/faq", response_model=list[schemas.FAQ])
def list_faqs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.FAQ).order_by(models.FAQ.order_index).offset(skip).limit(limit).all()

@router.get("/faq/{faq_id}", response_model=schemas.FAQ)
def get_faq(faq_id: int, db: Session = Depends(get_db)):
    db_faq = db.query(models.FAQ).filter(models.FAQ.id == faq_id).first()
    if not db_faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return db_faq

@router.put("/faq/{faq_id}", response_model=schemas.FAQ)
def update_faq(faq_id: int, faq: schemas.FAQCreate, db: Session = Depends(get_db)):
    db_faq = db.query(models.FAQ).filter(models.FAQ.id == faq_id).first()
    if not db_faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    for key, value in faq.dict().items():
        setattr(db_faq, key, value)
    db.commit()
    db.refresh(db_faq)
    return db_faq

@router.delete("/faq/{faq_id}")
def delete_faq(faq_id: int, db: Session = Depends(get_db)):
    db_faq = db.query(models.FAQ).filter(models.FAQ.id == faq_id).first()
    if not db_faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    db.delete(db_faq)
    db.commit()
    return {"message": "FAQ deleted successfully"}
```

### Start Backend Server

To run the FastAPI server:

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000` and the interactive documentation at `http://localhost:8000/docs`.

---

## Frontend Setup (React)

### Create React App

Navigate to the frontend directory and create a React application:

```bash
cd frontend
npx create-react-app .
npm install axios react-router-dom
```

### Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── Services.jsx
│   │   ├── ServiceDetail.jsx
│   │   ├── Booking.jsx
│   │   ├── Reviews.jsx
│   │   ├── Contact.jsx
│   │   ├── Blog.jsx
│   │   ├── FAQ.jsx
│   │   └── Footer.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── ServicePage.jsx
│   │   ├── BookingPage.jsx
│   │   └── BlogPage.jsx
│   ├── styles/
│   │   └── index.css
│   ├── App.jsx
│   ├── App.css
│   └── index.js
├── package.json
└── README.md
```

### Key Components & Pages

Create `src/App.jsx`:

```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ServicePage from './pages/ServicePage';
import BookingPage from './pages/BookingPage';
import BlogPage from './pages/BlogPage';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services/:slug" element={<ServicePage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/blog" element={<BlogPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
```

Create `src/components/Navbar.jsx`:

```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span>Quality Mobile Detailing</span>
        </Link>
        <ul className="nav-menu">
          <li><Link to="/">Home</Link></li>
          <li><a href="/#services">Services</a></li>
          <li><a href="/#reviews">Reviews</a></li>
          <li><a href="/#blog">Blog</a></li>
          <li><a href="/#faq">FAQ</a></li>
          <li><a href="/#contact">Contact</a></li>
          <li><Link to="/booking" className="schedule-btn">Schedule Now</Link></li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
```

Create `src/pages/Home.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Reviews from '../components/Reviews';
import Blog from '../components/Blog';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';
import axios from 'axios';

function Home() {
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, reviewsRes] = await Promise.all([
          axios.get('http://localhost:8000/api/services/'),
          axios.get('http://localhost:8000/api/reviews/verified?limit=10')
        ]);
        setServices(servicesRes.data);
        setReviews(reviewsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <main>
      <Hero />
      <Services services={services} id="services" />
      <Reviews reviews={reviews} id="reviews" />
      <Blog id="blog" />
      <FAQ id="faq" />
      <Contact id="contact" />
    </main>
  );
}

export default Home;
```

Create `src/components/Hero.jsx`:

```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Professional Mobile Auto Detailing</h1>
        <p>Experience premium car detailing service at your doorstep</p>
        <div className="hero-buttons">
          <Link to="/booking" className="btn btn-primary">Schedule Now</Link>
          <a href="tel:(410)575-4616" className="btn btn-secondary">Call (410) 575-4616</a>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <h3>250+</h3>
            <p>5-Star Reviews</p>
          </div>
          <div className="stat">
            <h3>Maryland & DC</h3>
            <p>Service Area</p>
          </div>
          <div className="stat">
            <h3>Professional</h3>
            <p>Quality Service</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
```

Create `src/components/Services.jsx`:

```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Services.css';

function Services({ services, id }) {
  const serviceCards = [
    { name: 'Ceramic Coating', slug: 'ceramic-coating', icon: '🛡️' },
    { name: 'In & Out Detailing', slug: 'full-detailing', icon: '✨' },
    { name: 'Interior Detailing', slug: 'interior-detailing', icon: '🧼' },
    { name: 'Exterior Detailing', slug: 'exterior-detailing', icon: '🚗' },
    { name: 'Fleet Detailing', slug: 'fleet-detailing', icon: '🚐' },
    { name: 'Maintenance Detailing', slug: 'maintenance-detailing', icon: '🔧' }
  ];

  return (
    <section id={id} className="services">
      <div className="services-container">
        <h2>Our Services</h2>
        <p>Choose the detailing service that's right for you</p>
        <div className="services-grid">
          {serviceCards.map((service) => (
            <Link key={service.slug} to={`/services/${service.slug}`} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.name}</h3>
              <p>Learn more →</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
```

Create `src/components/Reviews.jsx`:

```jsx
import React from 'react';
import './Reviews.css';

function Reviews({ reviews, id }) {
  return (
    <section id={id} className="reviews">
      <div className="reviews-container">
        <h2>Customer Reviews</h2>
        <p>5-Star Rating on Google with OVER 250 Reviews</p>
        <div className="reviews-grid">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-rating">
                {'⭐'.repeat(review.rating)}
              </div>
              <p className="review-comment">{review.comment}</p>
              <p className="review-author">- Customer</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Reviews;
```

Create `src/components/Contact.jsx`:

```jsx
import React, { useState } from 'react';
import axios from 'axios';
import './Contact.css';

function Contact({ id }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/contact/', formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <section id={id} className="contact">
      <div className="contact-container">
        <h2>Get in Touch</h2>
        <div className="contact-content">
          <div className="contact-info">
            <h3>Contact Information</h3>
            <p><strong>Phone:</strong> <a href="tel:(410)575-4616">(410) 575-4616</a></p>
            <p><strong>Email:</strong> <a href="mailto:KevinQualityMobileDetailing@gmail.com">KevinQualityMobileDetailing@gmail.com</a></p>
            <p><strong>Address:</strong> 911 Autumn Valley Ln, Gambrills, MD 21054</p>
            <p><strong>Hours:</strong> Monday - Sunday: 6:00 AM - 8:00 PM</p>
          </div>
          <form onSubmit={handleSubmit} className="contact-form">
            {submitted && <p className="success-message">Thank you! We'll be in touch soon.</p>}
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Your Phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <textarea
              name="message"
              placeholder="Your Message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
            <button type="submit" className="btn btn-primary">Send Message</button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
```

Create `src/components/Footer.jsx`:

```jsx
import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>Quality Mobile Detailing</h4>
          <p>Professional auto detailing services in Maryland and DC</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/#services">Services</a></li>
            <li><a href="/#reviews">Reviews</a></li>
            <li><a href="/#contact">Contact</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Phone: <a href="tel:(410)575-4616">(410) 575-4616</a></p>
          <p>Email: <a href="mailto:KevinQualityMobileDetailing@gmail.com">Kevin...</a></p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Quality Mobile Detailing. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
```

### Start Frontend Server

```bash
cd frontend
npm start
```

The React app will run on `http://localhost:3000`.

---

## Styling & Design

### Main CSS Files

Create `src/App.css`:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  color: #333;
  background-color: #f9f9f9;
}

.btn {
  display: inline-block;
  padding: 12px 30px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: bold;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: transparent;
  color: #007bff;
  border: 2px solid #007bff;
}

.btn-secondary:hover {
  background-color: #007bff;
  color: white;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  font-size: 18px;
}
```

Create `src/components/Navbar.css`:

```css
.navbar {
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 50px;
  max-width: 1200px;
  margin: 0 auto;
}

.navbar-logo {
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
  text-decoration: none;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 30px;
  align-items: center;
}

.nav-menu a {
  color: #333;
  text-decoration: none;
  transition: color 0.3s;
}

.nav-menu a:hover {
  color: #007bff;
}

.schedule-btn {
  background-color: #007bff;
  color: white !important;
  padding: 10px 20px;
  border-radius: 5px;
}

.schedule-btn:hover {
  background-color: #0056b3;
}

@media (max-width: 768px) {
  .navbar-container {
    padding: 15px 20px;
  }

  .nav-menu {
    flex-direction: column;
    gap: 10px;
  }
}
```

Create `src/components/Hero.css`:

```css
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 100px 20px;
  text-align: center;
}

.hero-content h1 {
  font-size: 48px;
  margin-bottom: 20px;
}

.hero-content p {
  font-size: 20px;
  margin-bottom: 30px;
  opacity: 0.9;
}

.hero-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 50px;
  flex-wrap: wrap;
}

.hero-stats {
  display: flex;
  justify-content: space-around;
  max-width: 800px;
  margin: 0 auto;
  gap: 40px;
}

.stat h3 {
  font-size: 32px;
  margin-bottom: 10px;
}

.stat p {
  font-size: 14px;
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 32px;
  }

  .hero-buttons {
    flex-direction: column;
  }

  .hero-stats {
    flex-direction: column;
  }
}
```

Create `src/components/Services.css`:

```css
.services {
  padding: 80px 20px;
  background-color: #f9f9f9;
}

.services-container {
  max-width: 1200px;
  margin: 0 auto;
}

.services-container h2 {
  text-align: center;
  font-size: 36px;
  margin-bottom: 10px;
}

.services-container > p {
  text-align: center;
  color: #666;
  margin-bottom: 50px;
  font-size: 16px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.service-card {
  background: white;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  text-decoration: none;
  color: #333;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.15);
}

.service-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.service-card h3 {
  font-size: 20px;
  margin-bottom: 10px;
}

.service-card p {
  color: #007bff;
  font-weight: bold;
}
```

Create `src/components/Reviews.css`:

```css
.reviews {
  padding: 80px 20px;
  background-color: white;
}

.reviews-container {
  max-width: 1200px;
  margin: 0 auto;
}

.reviews-container h2 {
  text-align: center;
  font-size: 36px;
  margin-bottom: 10px;
}

.reviews-container > p {
  text-align: center;
  color: #666;
  margin-bottom: 50px;
  font-size: 16px;
}

.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.review-card {
  background-color: #f9f9f9;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.review-rating {
  margin-bottom: 15px;
  font-size: 20px;
}

.review-comment {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 15px;
  font-style: italic;
}

.review-author {
  color: #666;
  font-weight: bold;
}
```

Create `src/components/Contact.css`:

```css
.contact {
  padding: 80px 20px;
  background-color: #f9f9f9;
}

.contact-container {
  max-width: 1200px;
  margin: 0 auto;
}

.contact-container h2 {
  text-align: center;
  font-size: 36px;
  margin-bottom: 50px;
}

.contact-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px;
}

.contact-info h3 {
  margin-bottom: 20px;
  font-size: 20px;
}

.contact-info p {
  margin-bottom: 15px;
  line-height: 1.6;
}

.contact-info a {
  color: #007bff;
  text-decoration: none;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.contact-form input,
.contact-form textarea {
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-family: inherit;
  font-size: 14px;
}

.contact-form input:focus,
.contact-form textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0,123,255,0.3);
}

.success-message {
  color: #28a745;
  background-color: #d4edda;
  padding: 12px;
  border-radius: 5px;
  text-align: center;
}

@media (max-width: 768px) {
  .contact-content {
    grid-template-columns: 1fr;
  }
}
```

Create `src/components/Footer.css`:

```css
.footer {
  background-color: #333;
  color: white;
  padding: 40px 20px 20px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 30px;
}

.footer-section h4 {
  margin-bottom: 15px;
  font-size: 16px;
}

.footer-section p {
  color: #ccc;
  line-height: 1.6;
  margin-bottom: 10px;
}

.footer-section a {
  color: #007bff;
  text-decoration: none;
}

.footer-section a:hover {
  text-decoration: underline;
}

.footer-section ul {
  list-style: none;
}

.footer-section li {
  margin-bottom: 8px;
}

.footer-bottom {
  text-align: center;
  border-top: 1px solid #555;
  padding-top: 20px;
  color: #999;
}
```

---

## Deployment

### Docker Setup (Optional)

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Create `frontend/Dockerfile`:

```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:13-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: quality_detailing_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/quality_detailing_db
    ports:
      - "8000:8000"

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

Deploy with Docker:

```bash
docker-compose up -d
```

---

## Testing & Verification

### Verify Backend

Test the API endpoints:

```bash
# Health check
curl http://localhost:8000/health

# Get services
curl http://localhost:8000/api/services/

# Get API documentation
# Visit http://localhost:8000/docs in browser
```

### Verify Frontend

Open `http://localhost:3000` in your browser and check:
- Navigation bar loads
- Hero section displays
- Services grid is visible
- Contact form works
- Footer displays properly

### Sample Data

Add sample data via API or database:

```python
# In backend, create seed data script (app/seed.py)
from app.database import SessionLocal
from app import models

db = SessionLocal()

# Create services
services_data = [
    {"name": "Ceramic Coating", "slug": "ceramic-coating", "description": "Protective coating for your vehicle"},
    {"name": "Interior Detailing", "slug": "interior-detailing", "description": "Deep clean interior"},
    # ... more services
]

for service_data in services_data:
    service = models.Service(**service_data)
    db.add(service)

db.commit()
```

Run with: `python app/seed.py`

---

## Final Checklist

- [ ] PostgreSQL database created and tables initialized
- [ ] Backend FastAPI server running on port 8000
- [ ] Frontend React app running on port 3000
- [ ] Navigation links working
- [ ] Service cards displaying
- [ ] Booking form functional
- [ ] Contact form submitting to database
- [ ] Reviews showing from database
- [ ] Blog posts retrievable
- [ ] FAQs loading
- [ ] API documentation accessible at /docs
- [ ] CORS configured correctly
- [ ] Styling matches original website
- [ ] Mobile responsive design working

---

## Conclusion

This guide provides all the steps needed to build a fully functional Quality Mobile Detailing website with FastAPI, PostgreSQL, and React. The architecture is scalable and includes all major features from the original website including services, booking, reviews, blog, and contact forms.

For production deployment, consider using services like AWS, Heroku, or DigitalOcean for hosting and implement additional security measures like authentication, HTTPS, and rate limiting.