from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter()

@router.post("/info", response_model=schemas.BusinessInfo)
def create_business_info(info: schemas.BusinessInfoCreate, db: Session = Depends(get_db)):
    db_info = models.BusinessInfo(**info.model_dump())
    db.add(db_info)
    db.commit()
    db.refresh(db_info)
    return db_info

@router.get("/info", response_model=schemas.BusinessInfo)
def get_business_info(db: Session = Depends(get_db)):
    db_info = db.query(models.BusinessInfo).first()
    if not db_info:
        raise HTTPException(status_code=404, detail="Business info not found")
    return db_info

@router.put("/info/{info_id}", response_model=schemas.BusinessInfo)
def update_business_info(info_id: int, info: schemas.BusinessInfoCreate, db: Session = Depends(get_db)):
    db_info = db.query(models.BusinessInfo).filter(models.BusinessInfo.id == info_id).first()
    if not db_info:
        raise HTTPException(status_code=404, detail="Business info not found")
    for key, value in info.model_dump().items():
        setattr(db_info, key, value)
    db.commit()
    db.refresh(db_info)
    return db_info

@router.post("/faq", response_model=schemas.FAQ)
def create_faq(faq: schemas.FAQCreate, db: Session = Depends(get_db)):
    db_faq = models.FAQ(**faq.model_dump())
    db.add(db_faq)
    db.commit()
    db.refresh(db_faq)
    return db_faq

@router.get("/faq", response_model=list[schemas.FAQ])
def list_faqs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.FAQ).order_by(models.FAQ.order_index).offset(skip).limit(limit).all()

@router.get("/faq/{faq_id}", response_model=schemas.FAQ)
def get_faq(faq_id: int, db: Session = Depends(get_db)):
    db_faq = db.query(models.FAQ).filter(models.FAQ.id == faq_id).first()
    if not db_faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return db_faq

@router.put("/faq/{faq_id}", response_model=schemas.FAQ)
def update_faq(faq_id: int, faq: schemas.FAQCreate, db: Session = Depends(get_db)):
    db_faq = db.query(models.FAQ).filter(models.FAQ.id == faq_id).first()
    if not db_faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    for key, value in faq.model_dump().items():
        setattr(db_faq, key, value)
    db.commit()
    db.refresh(db_faq)
    return db_faq

@router.delete("/faq/{faq_id}")
def delete_faq(faq_id: int, db: Session = Depends(get_db)):
    db_faq = db.query(models.FAQ).filter(models.FAQ.id == faq_id).first()
    if not db_faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    db.delete(db_faq)
    db.commit()
    return {"message": "FAQ deleted successfully"}
