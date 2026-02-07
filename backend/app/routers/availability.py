from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import require_admin, is_admin
from app import models, schemas

router = APIRouter()

@router.get("", response_model=list[schemas.AvailableSlot])
def list_available_slots(
    from_date: Optional[datetime] = Query(None, description="Start (ISO)"),
    to_date: Optional[datetime] = Query(None, description="End (ISO)"),
    db: Session = Depends(get_db),
    admin: bool = Depends(is_admin),
):
    """List slots. Excludes taken slots unless admin (X-Admin-Secret)."""
    now = datetime.utcnow()
    start = from_date or now
    end = to_date or (now + timedelta(days=30))
    q = (
        db.query(models.AvailableSlot)
        .filter(models.AvailableSlot.slot_start >= start)
        .filter(models.AvailableSlot.slot_start <= end)
        .order_by(models.AvailableSlot.slot_start)
    )
    if not admin:
        taken_ids = [
            r[0]
            for r in db.query(models.Booking.available_slot_id)
            .filter(models.Booking.available_slot_id.isnot(None))
            .filter(models.Booking.status != "cancelled")
            .distinct()
            .all()
        ]
        if taken_ids:
            q = q.filter(~models.AvailableSlot.id.in_(taken_ids))
    return q.all()

@router.post("", response_model=schemas.AvailableSlot)
def create_available_slot(
    slot: schemas.AvailableSlotCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    """Admin: add an available slot."""
    db_slot = models.AvailableSlot(**slot.model_dump())
    db.add(db_slot)
    db.commit()
    db.refresh(db_slot)
    return db_slot

@router.delete("/{slot_id}")
def delete_available_slot(
    slot_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    """Admin: remove a slot."""
    db_slot = (
        db.query(models.AvailableSlot)
        .filter(models.AvailableSlot.id == slot_id)
        .first()
    )
    if not db_slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    db.delete(db_slot)
    db.commit()
    return {"message": "Slot deleted"}
