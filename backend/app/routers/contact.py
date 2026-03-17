import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.email_send import send_email, OWNER_EMAIL, is_configured

logger = logging.getLogger(__name__)
router = APIRouter()


def _send_contact_emails(msg: models.ContactMessage):
    """Email owner with contact form content and send confirmation to customer."""
    if not is_configured():
        logger.warning("No email provider configured; contact saved but no email sent")
        return
    owner_to = (OWNER_EMAIL or "").strip()
    if not owner_to:
        return
    subject = f"Contact form: from {msg.name}"
    body = (
        f"Name: {msg.name}\n"
        f"Email: {msg.email}\n"
        f"Phone: {msg.phone or '(not provided)'}\n\n"
        f"Message:\n{msg.message}"
    )
    send_email(owner_to, subject, body)
    customer_subject = "We received your message – YMB Habesha Mobile Detailing"
    customer_body = (
        f"Hi {msg.name},\n\n"
        "Thanks for reaching out. We've received your message and will get back "
        "to you soon.\n\n— YMB Habesha Mobile Detailing"
    )
    send_email(msg.email, customer_subject, customer_body)


@router.post("", response_model=schemas.ContactMessage)
def create_contact_message(
    message: schemas.ContactMessageCreate, db: Session = Depends(get_db)
):
    db_message = models.ContactMessage(**message.model_dump())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    try:
        _send_contact_emails(db_message)
    except Exception as e:
        logger.exception("Contact form email failed: %s", e)
    return db_message

@router.get("", response_model=list[schemas.ContactMessage])
def list_contact_messages(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    return db.query(models.ContactMessage).offset(skip).limit(limit).all()

@router.get("/{message_id}", response_model=schemas.ContactMessage)
def get_contact_message(message_id: int, db: Session = Depends(get_db)):
    db_message = (
        db.query(models.ContactMessage)
        .filter(models.ContactMessage.id == message_id)
        .first()
    )
    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found")
    return db_message

@router.delete("/{message_id}")
def delete_contact_message(message_id: int, db: Session = Depends(get_db)):
    db_message = (
        db.query(models.ContactMessage)
        .filter(models.ContactMessage.id == message_id)
        .first()
    )
    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found")
    db.delete(db_message)
    db.commit()
    return {"message": "Message deleted successfully"}
