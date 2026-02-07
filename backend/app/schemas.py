from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional

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
    model_config = ConfigDict(from_attributes=True)

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
    model_config = ConfigDict(from_attributes=True)

# Package Schemas
class PackageBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Optional[float] = None
    price_small: Optional[float] = None
    price_medium: Optional[float] = None
    price_large: Optional[float] = None
    price_original_small: Optional[float] = None
    price_original_medium: Optional[float] = None
    price_original_large: Optional[float] = None
    duration_minutes: Optional[int] = None
    turnaround_hours: Optional[int] = None
    details: Optional[str] = None
    image_url: Optional[str] = None
    display_order: Optional[int] = None

class PackageCreate(PackageBase):
    service_id: int

class Package(PackageBase):
    id: int
    service_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class PackageWithService(BaseModel):
    """Package with service info for detail page."""
    id: int
    service_id: int
    name: str
    description: Optional[str] = None
    price: Optional[float] = None
    price_small: Optional[float] = None
    price_medium: Optional[float] = None
    price_large: Optional[float] = None
    price_original_small: Optional[float] = None
    price_original_medium: Optional[float] = None
    price_original_large: Optional[float] = None
    duration_minutes: Optional[int] = None
    turnaround_hours: Optional[int] = None
    details: Optional[str] = None
    image_url: Optional[str] = None
    display_order: Optional[int] = None
    created_at: datetime
    service_name: Optional[str] = None
    service_slug: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# Booking Schemas
class BookingBase(BaseModel):
    scheduled_date: datetime
    status: str = "pending"
    location: Optional[str] = None
    notes: Optional[str] = None

class BookingCreate(BookingBase):
    customer_id: int
    package_id: int
    available_slot_id: Optional[int] = None


class BookingCreateMulti(BookingBase):
    """Create one booking with multiple packages (cart/checkout)."""
    customer_id: int
    package_ids: list[int]
    available_slot_id: Optional[int] = None


class Booking(BookingBase):
    id: int
    customer_id: int
    package_id: Optional[int] = None
    available_slot_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class BookingPackageInfo(BaseModel):
    id: int
    name: str
    price: Optional[float] = None
    duration_minutes: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)


class BookingItemInfo(BaseModel):
    id: int
    package_id: int
    quantity: int
    package: Optional[BookingPackageInfo] = None
    model_config = ConfigDict(from_attributes=True)


class BookingCustomerInfo(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class BookingWithDetails(BookingBase):
    id: int
    customer_id: int
    package_id: Optional[int] = None
    available_slot_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    customer: Optional[BookingCustomerInfo] = None
    package: Optional[BookingPackageInfo] = None
    booking_items: list[BookingItemInfo] = []
    model_config = ConfigDict(from_attributes=True)


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
    model_config = ConfigDict(from_attributes=True)

# Contact Message Schemas
class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str

class ContactMessage(ContactMessageCreate):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

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
    model_config = ConfigDict(from_attributes=True)

# Available Slot Schemas
class AvailableSlotCreate(BaseModel):
    slot_start: datetime
    slot_end: Optional[datetime] = None

class AvailableSlot(BaseModel):
    id: int
    slot_start: datetime
    slot_end: Optional[datetime] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# FAQ Schemas
class FAQCreate(BaseModel):
    question: str
    answer: str
    order_index: Optional[int] = None

class FAQ(FAQCreate):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

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
    model_config = ConfigDict(from_attributes=True)
