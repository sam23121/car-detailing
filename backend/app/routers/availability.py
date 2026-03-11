from datetime import datetime, timedelta, time
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import require_admin, is_admin
from app import models, schemas
from app.crud import services as crud_services
from app.crud.bookings import DEFAULT_BOOKING_DURATION_MINUTES

router = APIRouter()

SLOT_INTERVAL_MINUTES = 30
DEFAULT_REQUIRED_HOURS = 2


def _required_minutes_for_packages(db: Session, package_ids: list[int]) -> int:
    """Sum of package turnaround (hours) + 2 hours, in minutes."""
    total_hours = 2.0  # base 2 hours
    for pid in package_ids or []:
        pkg = crud_services.get_package(db, pid)
        if not pkg:
            continue
        if pkg.turnaround_hours is not None:
            total_hours += pkg.turnaround_hours
        elif pkg.duration_minutes is not None:
            total_hours += pkg.duration_minutes / 60.0
    return int(total_hours * 60)


def _end_of_day(d: datetime) -> datetime:
    return datetime.combine(d.date(), time(23, 59, 59), tzinfo=d.tzinfo)


@router.get("/bookable-slots", response_model=list[schemas.BookableSlotOption])
def list_bookable_slots(
    from_date: Optional[datetime] = Query(None, description="Start (ISO)"),
    to_date: Optional[datetime] = Query(None, description="End (ISO)"),
    package_ids: Optional[list[int]] = Query(
        None, description="Package IDs in cart (turnaround sum + 2h = slot length)"
    ),
    db: Session = Depends(get_db),
):
    """Bookable start times: 30-min steps; duration = package turnarounds + 2h."""
    now = datetime.utcnow()
    start = from_date or now
    end = to_date or (now + timedelta(days=30))
    required_minutes = _required_minutes_for_packages(db, package_ids or [])

    slots = (
        db.query(models.AvailableSlot)
        .filter(models.AvailableSlot.slot_start >= start)
        .filter(models.AvailableSlot.slot_start <= end)
        .order_by(models.AvailableSlot.slot_start)
        .all()
    )
    # Existing bookings with duration for overlap check
    bookings = (
        db.query(models.Booking)
        .filter(models.Booking.status != "cancelled")
        .filter(models.Booking.scheduled_date >= start - timedelta(days=1))
        .filter(models.Booking.scheduled_date <= end + timedelta(days=1))
        .all()
    )

    result = []
    required_delta = timedelta(minutes=required_minutes)
    interval = timedelta(minutes=SLOT_INTERVAL_MINUTES)

    for slot in slots:
        slot_start = slot.slot_start
        slot_end = slot.slot_end if slot.slot_end else _end_of_day(slot_start)
        if slot_end <= slot_start:
            continue
        # Last possible start so that [start, start+required] fits in slot
        last_start = slot_end - required_delta
        if last_start < slot_start:
            continue

        current = slot_start
        while current <= last_start:
            candidate_end = current + required_delta
            # Overlap: booking [b_start, b_end] vs [current, candidate_end]
            overlaps = False
            for b in bookings:
                b_start = b.scheduled_date
                b_minutes = (
                    b.duration_minutes
                    if b.duration_minutes is not None
                    else DEFAULT_BOOKING_DURATION_MINUTES
                )
                b_end = b_start + timedelta(minutes=b_minutes)
                if b_start < candidate_end and b_end > current:
                    overlaps = True
                    break
            if not overlaps:
                result.append(
                    schemas.BookableSlotOption(start=current, available_slot_id=slot.id)
                )
            current += interval

    # Dedupe by start; sort by start
    seen = set()
    unique = []
    for r in result:
        key = r.start.isoformat()
        if key not in seen:
            seen.add(key)
            unique.append(r)
    unique.sort(key=lambda x: x.start)
    return unique


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

def _slot_overlaps_existing(
    db: Session, slot_start: datetime, slot_end: datetime | None
) -> bool:
    """True if this slot overlaps any existing slot (same day, overlapping time)."""
    day_start = slot_start.replace(hour=0, minute=0, second=0, microsecond=0)
    day_end = day_start + timedelta(days=1) - timedelta(microseconds=1)
    end = slot_end if slot_end is not None else day_end
    existing = (
        db.query(models.AvailableSlot)
        .filter(models.AvailableSlot.slot_start >= day_start)
        .filter(models.AvailableSlot.slot_start < day_start + timedelta(days=1))
        .all()
    )
    for ex in existing:
        ex_end = ex.slot_end if ex.slot_end is not None else day_end
        if slot_start < ex_end and end > ex.slot_start:
            return True
    return False


@router.post("/batch", response_model=schemas.AvailableSlotBatchResult)
def create_available_slots_batch(
    body: schemas.AvailableSlotBatchCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    """Admin: add multiple slots; duplicates (overlapping same day) are skipped."""
    created = []
    duplicates_skipped = 0
    for s in body.slots:
        if _slot_overlaps_existing(db, s.slot_start, s.slot_end):
            duplicates_skipped += 1
            continue
        db_slot = models.AvailableSlot(slot_start=s.slot_start, slot_end=s.slot_end)
        db.add(db_slot)
        db.flush()
        db.refresh(db_slot)
        created.append(db_slot)
    db.commit()
    for c in created:
        db.refresh(c)
    return schemas.AvailableSlotBatchResult(
        created=created, duplicates_skipped=duplicates_skipped
    )


@router.post("", response_model=schemas.AvailableSlot)
def create_available_slot(
    slot: schemas.AvailableSlotCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    """Admin: add an available slot."""
    if _slot_overlaps_existing(db, slot.slot_start, slot.slot_end):
        raise HTTPException(
            status_code=409,
            detail="A slot overlapping this date and time already exists.",
        )
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
