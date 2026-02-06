from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter()

@router.post("/", response_model=schemas.ContactMessage)
def create_contact_message(message: schemas.ContactMessageCreate, db: Session = Depends(get_db)):
    db_message = models.ContactMessage(**message.model_dump())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@router.get("/", response_model=list[schemas.ContactMessage])
def list_contact_messages(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.ContactMessage).offset(skip).limit(limit).all()

@router.get("/{message_id}", response_model=schemas.ContactMessage)
def get_contact_message(message_id: int, db: Session = Depends(get_db)):
    db_message = db.query(models.ContactMessage).filter(models.ContactMessage.id == message_id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found")
    return db_message

@router.delete("/{message_id}")
def delete_contact_message(message_id: int, db: Session = Depends(get_db)):
    db_message = db.query(models.ContactMessage).filter(models.ContactMessage.id == message_id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found")
    db.delete(db_message)
    db.commit()
    return {"message": "Message deleted successfully"}
