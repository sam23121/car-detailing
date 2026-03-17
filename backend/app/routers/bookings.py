import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas
from app.auth import require_admin
from app.crud import bookings as crud_bookings
from app.database import get_db


logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("", response_model=schemas.Booking)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    try:
        db_booking = crud_bookings.create_booking(db=db, booking=booking)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    try:
        from app.notify import send_booking_notifications
        send_booking_notifications(db, db_booking.id)
    except Exception as e:
        logger.exception(
            "send_booking_notifications failed for booking_id=%s: %s",
            getattr(db_booking, "id", None),
            e,
        )
    return db_booking


@router.post("/multi", response_model=schemas.Booking)
def create_booking_multi(
    payload: schemas.BookingCreateMulti, db: Session = Depends(get_db)
):
    """Create one booking with multiple packages from cart."""
    if not payload.package_ids:
        raise HTTPException(status_code=400, detail="At least one package is required")
    try:
        db_booking = crud_bookings.create_booking_multi(db=db, payload=payload)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    if db_booking:
        try:
            from app.notify import send_booking_notifications
            send_booking_notifications(db, db_booking.id)
        except Exception as e:
            logger.exception(
                "send_booking_notifications failed for multi booking_id=%s: %s",
                getattr(db_booking, "id", None),
                e,
            )
    return db_booking


@router.get("", response_model=list[schemas.Booking])
def list_bookings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_bookings.get_bookings(db, skip=skip, limit=limit)


@router.get("/with-details", response_model=list[schemas.BookingWithDetails])
def list_bookings_with_details(
    skip: int = 0,
    limit: int = 100,
    include_archived: bool = False,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    """For owner view. Hides completed >7 days by default; all states kept in DB. Admin only."""
    return crud_bookings.get_bookings_with_details(
        db, skip=skip, limit=limit, include_archived=include_archived
    )


@router.get("/{booking_id}", response_model=schemas.Booking)
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    db_booking = crud_bookings.get_booking(db, booking_id=booking_id)
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return db_booking

@router.get("/customer/{customer_id}", response_model=list[schemas.Booking])
def get_customer_bookings(customer_id: int, db: Session = Depends(get_db)):
    return crud_bookings.get_customer_bookings(db, customer_id=customer_id)

@router.put("/{booking_id}", response_model=schemas.Booking)
def update_booking(
    booking_id: int, booking: schemas.BookingCreate, db: Session = Depends(get_db)
):
    existing = crud_bookings.get_booking(db, booking_id=booking_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Booking not found")
    old_status = existing.status
    db_booking = crud_bookings.update_booking(
        db=db, booking_id=booking_id, booking=booking
    )
    # When admin confirms a pending booking, email the customer
    if old_status == "pending" and booking.status == "confirmed":
        try:
            from app.notify import send_booking_confirmed_notification
            send_booking_confirmed_notification(db, booking_id)
        except Exception as e:
            logger.exception(
                "send_booking_confirmed_notification failed for booking_id=%s: %s",
                booking_id,
                e,
            )
    return db_booking

@router.delete("/{booking_id}", response_model=schemas.Booking)
def delete_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    db_booking = crud_bookings.delete_booking(db=db, booking_id=booking_id)
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return db_booking
