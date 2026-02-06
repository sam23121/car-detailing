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
