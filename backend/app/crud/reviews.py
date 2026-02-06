from sqlalchemy.orm import Session
from app import models, schemas

def create_review(db: Session, review: schemas.ReviewCreate):
    db_review = models.Review(**review.model_dump())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def get_review(db: Session, review_id: int):
    return db.query(models.Review).filter(models.Review.id == review_id).first()

def get_reviews(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Review).offset(skip).limit(limit).all()

def get_service_reviews(db: Session, service_id: int):
    return db.query(models.Review).filter(models.Review.service_id == service_id).all()

def get_verified_reviews(db: Session, limit: int = 10):
    return db.query(models.Review).filter(models.Review.verified == True).order_by(models.Review.created_at.desc()).limit(limit).all()

def update_review(db: Session, review_id: int, review: schemas.ReviewCreate):
    db_review = get_review(db, review_id)
    if db_review:
        for key, value in review.model_dump().items():
            setattr(db_review, key, value)
        db.commit()
        db.refresh(db_review)
    return db_review

def delete_review(db: Session, review_id: int):
    db_review = get_review(db, review_id)
    if db_review:
        db.delete(db_review)
        db.commit()
    return db_review
