"""Send email and SMS when a booking is created. Uses Resend and Twilio (env-configured)."""
import logging
import os
from datetime import datetime

logger = logging.getLogger(__name__)

OWNER_EMAIL = os.environ.get("OWNER_EMAIL", "smlalene@gmail.com")
OWNER_PHONE = os.environ.get("OWNER_PHONE", "7024707392")
RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
RESEND_FROM = os.environ.get("RESEND_FROM_EMAIL", "Quality Detailing <onboarding@resend.dev>")
TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")
TWILIO_FROM_NUMBER = os.environ.get("TWILIO_FROM_NUMBER")


def _format_datetime(dt):
    if dt is None:
        return ""
    if isinstance(dt, str):
        dt = datetime.fromisoformat(dt.replace("Z", "+00:00"))
    return dt.strftime("%B %d, %Y at %I:%M %p")


def _booking_summary(booking):
    """Build a short text summary of the booking."""
    c = booking.customer
    if not c:
        return "Booking (no customer info)"
    parts = [f"{c.name} ({c.email})", f"Date: {_format_datetime(booking.scheduled_date)}"]
    if c.phone:
        parts.append(f"Phone: {c.phone}")
    if booking.booking_items:
        names = [item.package.name if item.package else f"Package #{item.package_id}" for item in booking.booking_items]
        parts.append("Packages: " + ", ".join(names))
    elif booking.package:
        parts.append(f"Package: {booking.package.name}")
    if booking.notes:
        parts.append(f"Notes: {booking.notes}")
    return "\n".join(parts)


def _send_email(to: str, subject: str, body_text: str):
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set; skipping email to %s", to)
        return
    try:
        import resend
        resend.api_key = RESEND_API_KEY
        resend.Emails.send({
            "from": RESEND_FROM,
            "to": [to],
            "subject": subject,
            "html": body_text.replace("\n", "<br>\n"),
        })
    except Exception as e:
        logger.exception("Resend send failed to %s: %s", to, e)


def _send_sms(to: str, body: str):
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN or not TWILIO_FROM_NUMBER:
        logger.warning("Twilio not configured; skipping SMS to %s", to)
        return
    to_e164 = to.strip()
    if not to_e164.startswith("+"):
        to_e164 = "+1" + to_e164.replace("-", "").replace(" ", "")
    try:
        from twilio.rest import Client
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        client.messages.create(from_=TWILIO_FROM_NUMBER, to=to_e164, body=body)
    except Exception as e:
        logger.exception("Twilio send failed to %s: %s", to_e164, e)


def send_booking_notifications(db, booking_id: int):
    """After a booking is created: email customer, email owner, SMS owner."""
    from app.crud import bookings as crud_bookings
    booking = crud_bookings.get_booking_with_details(db, booking_id)
    if not booking or not booking.customer:
        return
    summary = _booking_summary(booking)
    customer_email = booking.customer.email
    customer_name = booking.customer.name
    date_str = _format_datetime(booking.scheduled_date)

    # Email to customer (confirmation)
    customer_subject = "Booking request received – Quality Mobile Detailing"
    customer_body = (
        f"Hi {customer_name},\n\n"
        f"We received your booking request for {date_str}.\n\n"
        "We'll confirm shortly. If you have questions, reply to this email or give us a call.\n\n"
        "— Quality Mobile Detailing"
    )
    _send_email(customer_email, customer_subject, customer_body)

    # Email to owner
    owner_subject = "New booking request – Quality Mobile Detailing"
    owner_body = "New booking request:\n\n" + summary
    _send_email(OWNER_EMAIL, owner_subject, owner_body)

    # SMS to owner (short)
    sms_body = f"New booking: {customer_name} – {date_str}. Check admin."
    _send_sms(OWNER_PHONE, sms_body)
