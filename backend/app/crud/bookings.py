from sqlalchemy.orm import Session
from app import models, schemas
from app.crud import services as crud_services
from datetime import datetime, timedelta

# Default duration for legacy bookings with no duration_minutes
DEFAULT_BOOKING_DURATION_MINUTES = 120


def _duration_minutes_for_package_ids(db: Session, package_ids: list[int]) -> int:
    """Sum of package turnaround (hours) + 2 hours, in minutes."""
    total_hours = 2.0
    for pid in package_ids or []:
        pkg = crud_services.get_package(db, pid)
        if not pkg:
            continue
        if pkg.turnaround_hours is not None:
            total_hours += pkg.turnaround_hours
        elif pkg.duration_minutes is not None:
            total_hours += pkg.duration_minutes / 60.0
    return int(total_hours * 60)


def _booking_overlaps_existing(
    db: Session,
    scheduled_date: datetime,
    duration_minutes: int,
    exclude_booking_id: int | None = None,
) -> bool:
    """True if this time range overlaps any non-cancelled booking."""
    new_end = scheduled_date + timedelta(minutes=duration_minutes)
    q = (
        db.query(models.Booking)
        .filter(models.Booking.status != "cancelled")
        .filter(models.Booking.scheduled_date < new_end)
    )
    if exclude_booking_id is not None:
        q = q.filter(models.Booking.id != exclude_booking_id)
    for b in q.all():
        b_dur = (
            b.duration_minutes
            if b.duration_minutes is not None
            else DEFAULT_BOOKING_DURATION_MINUTES
        )
        b_end = b.scheduled_date + timedelta(minutes=b_dur)
        if b_end > scheduled_date:
            return True
    return False


def create_booking(db: Session, booking: schemas.BookingCreate):
    duration_minutes = _duration_minutes_for_package_ids(db, [booking.package_id])
    if _booking_overlaps_existing(db, booking.scheduled_date, duration_minutes):
        raise ValueError("This time slot is no longer available.")
    data = booking.model_dump()
    data["duration_minutes"] = duration_minutes
    db_booking = models.Booking(**data)
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking


def create_booking_multi(db: Session, payload: schemas.BookingCreateMulti):
    """Create one booking with multiple packages (from cart)."""
    if not payload.package_ids:
        return None
    first_id = payload.package_ids[0]
    duration_minutes = _duration_minutes_for_package_ids(db, payload.package_ids)
    if _booking_overlaps_existing(db, payload.scheduled_date, duration_minutes):
        raise ValueError("This time slot is no longer available.")
    db_booking = models.Booking(
        customer_id=payload.customer_id,
        package_id=first_id,
        available_slot_id=payload.available_slot_id,
        scheduled_date=payload.scheduled_date,
        duration_minutes=duration_minutes,
        status=payload.status,
        location=payload.location,
        notes=payload.notes,
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    for pid in payload.package_ids:
        db.add(models.BookingItem(booking_id=db_booking.id, package_id=pid, quantity=1))
    db.commit()
    db.refresh(db_booking)
    return db_booking

def get_booking(db: Session, booking_id: int):
    return db.query(models.Booking).filter(models.Booking.id == booking_id).first()

def get_bookings(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Booking).offset(skip).limit(limit).all()


def get_bookings_with_details(db: Session, skip: int = 0, limit: int = 100):
    """Return bookings with customer, package, and booking_items for owner display."""
    from sqlalchemy.orm import joinedload
    return (
        db.query(models.Booking)
        .options(
            joinedload(models.Booking.customer),
            joinedload(models.Booking.package),
            joinedload(models.Booking.booking_items).joinedload(models.BookingItem.package),
        )
        .order_by(models.Booking.scheduled_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_booking_with_details(db: Session, booking_id: int):
    """One booking with customer and booking_items.package for notifications."""
    from sqlalchemy.orm import joinedload
    return (
        db.query(models.Booking)
        .options(
            joinedload(models.Booking.customer),
            joinedload(models.Booking.package),
            joinedload(models.Booking.booking_items).joinedload(models.BookingItem.package),
        )
        .filter(models.Booking.id == booking_id)
        .first()
    )

def get_customer_bookings(db: Session, customer_id: int):
    return (
        db.query(models.Booking)
        .filter(models.Booking.customer_id == customer_id)
        .all()
    )

def update_booking(db: Session, booking_id: int, booking: schemas.BookingCreate):
    db_booking = get_booking(db, booking_id)
    if db_booking:
        for key, value in booking.model_dump(exclude_unset=True).items():
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
