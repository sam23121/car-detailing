from sqlalchemy.orm import Session
from app import models, schemas
from datetime import datetime

def create_booking(db: Session, booking: schemas.BookingCreate):
    db_booking = models.Booking(**booking.model_dump())
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

def get_booking(db: Session, booking_id: int):
    return db.query(models.Booking).filter(models.Booking.id == booking_id).first()

def get_bookings(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Booking).offset(skip).limit(limit).all()


def get_bookings_with_details(db: Session, skip: int = 0, limit: int = 100):
    """Return bookings with customer and package loaded for owner display."""
    from sqlalchemy.orm import joinedload
    return (
        db.query(models.Booking)
        .options(
            joinedload(models.Booking.customer),
            joinedload(models.Booking.package),
        )
        .order_by(models.Booking.scheduled_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_customer_bookings(db: Session, customer_id: int):
    return db.query(models.Booking).filter(models.Booking.customer_id == customer_id).all()

def update_booking(db: Session, booking_id: int, booking: schemas.BookingCreate):
    db_booking = get_booking(db, booking_id)
    if db_booking:
        for key, value in booking.model_dump().items():
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
