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


@router.get("/with-details", response_model=list[schemas.BookingWithDetails])
def list_bookings_with_details(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """For owner view: bookings with customer and package info."""
    return crud_bookings.get_bookings_with_details(db, skip=skip, limit=limit)


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
