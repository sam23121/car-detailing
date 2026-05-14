"""Admin-only JSON routes (X-Admin-Secret)."""
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app import models, schemas
from app.auth import require_admin
from app.database import get_db
from app.timezone import EASTERN, now_eastern

router = APIRouter()


def _month_range_et(now_et: datetime) -> tuple[datetime, datetime]:
    """[month_start, next_month_start) in Eastern for calendar-month filters."""
    y, m = now_et.year, now_et.month
    start = datetime(y, m, 1, 0, 0, 0, tzinfo=EASTERN)
    if m == 12:
        end_excl = datetime(y + 1, 1, 1, 0, 0, 0, tzinfo=EASTERN)
    else:
        end_excl = datetime(y, m + 1, 1, 0, 0, 0, tzinfo=EASTERN)
    return start, end_excl


def _service_label(booking: models.Booking) -> str:
    if booking.booking_items:
        parts: list[str] = []
        for item in booking.booking_items:
            pkg = item.package
            if not pkg:
                parts.append(f"#{item.package_id}")
                continue
            sn = (pkg.service and pkg.service.name) or ""
            parts.append(f"{sn} – {pkg.name}" if sn else pkg.name)
        return ", ".join(parts) if parts else "—"
    pkg = booking.package
    if not pkg:
        return "—"
    sn = (pkg.service and pkg.service.name) or ""
    return f"{sn} – {pkg.name}" if sn else pkg.name


@router.get("/dashboard/stats", response_model=schemas.DashboardStatsOut)
def dashboard_stats(
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
) -> schemas.DashboardStatsOut:
    now = now_eastern()
    month_start, month_end_excl = _month_range_et(now)

    total_this_month = (
        db.query(func.count(models.Booking.id))
        .filter(
            models.Booking.scheduled_date >= month_start,
            models.Booking.scheduled_date < month_end_excl,
        )
        .scalar()
        or 0
    )

    cancelled_this_month = (
        db.query(func.count(models.Booking.id))
        .filter(
            models.Booking.scheduled_date >= month_start,
            models.Booking.scheduled_date < month_end_excl,
            models.Booking.status == "cancelled",
        )
        .scalar()
        or 0
    )

    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    last_inclusive = today_start + timedelta(days=7)
    week_window_end = datetime(
        last_inclusive.year,
        last_inclusive.month,
        last_inclusive.day,
        23,
        59,
        59,
        999999,
        tzinfo=EASTERN,
    )

    upcoming_next_7_days = (
        db.query(func.count(models.Booking.id))
        .filter(
            models.Booking.status.in_(["pending", "confirmed"]),
            models.Booking.scheduled_date >= today_start,
            models.Booking.scheduled_date <= week_window_end,
        )
        .scalar()
        or 0
    )

    most_row = (
        db.query(models.Service.name, func.count(models.Booking.id))
        .join(models.Package, models.Package.service_id == models.Service.id)
        .join(models.Booking, models.Booking.package_id == models.Package.id)
        .filter(
            models.Booking.scheduled_date >= month_start,
            models.Booking.scheduled_date < month_end_excl,
            models.Booking.status != "cancelled",
            models.Booking.package_id.isnot(None),
        )
        .group_by(models.Service.id, models.Service.name)
        .order_by(func.count(models.Booking.id).desc())
        .first()
    )
    most_booked_service = most_row[0] if most_row else None

    recent_rows = (
        db.query(models.Booking)
        .options(
            joinedload(models.Booking.customer),
            joinedload(models.Booking.package).joinedload(models.Package.service),
            joinedload(models.Booking.booking_items)
            .joinedload(models.BookingItem.package)
            .joinedload(models.Package.service),
        )
        .order_by(models.Booking.created_at.desc())
        .limit(10)
        .all()
    )

    recent_appointments = [
        schemas.DashboardRecentBooking(
            id=b.id,
            scheduled_date=b.scheduled_date,
            client_name=(b.customer.name if b.customer else "—"),
            service_label=_service_label(b),
            status=b.status or "pending",
        )
        for b in recent_rows
    ]

    return schemas.DashboardStatsOut(
        total_this_month=int(total_this_month),
        upcoming_next_7_days=int(upcoming_next_7_days),
        cancelled_this_month=int(cancelled_this_month),
        most_booked_service=most_booked_service,
        recent_appointments=recent_appointments,
    )
