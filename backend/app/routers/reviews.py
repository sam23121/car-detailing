from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas
from app.crud import reviews as crud_reviews

router = APIRouter()

@router.post("/", response_model=schemas.Review)
def create_review(review: schemas.ReviewCreate, db: Session = Depends(get_db)):
    return crud_reviews.create_review(db=db, review=review)

@router.get("/", response_model=list[schemas.Review])
def list_reviews(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_reviews.get_reviews(db, skip=skip, limit=limit)

@router.get("/verified", response_model=list[schemas.Review])
def get_verified_reviews(limit: int = 10, db: Session = Depends(get_db)):
    return crud_reviews.get_verified_reviews(db, limit=limit)

@router.get("/{review_id}", response_model=schemas.Review)
def get_review(review_id: int, db: Session = Depends(get_db)):
    db_review = crud_reviews.get_review(db, review_id=review_id)
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    return db_review

@router.get("/service/{service_id}", response_model=list[schemas.Review])
def get_service_reviews(service_id: int, db: Session = Depends(get_db)):
    return crud_reviews.get_service_reviews(db, service_id=service_id)

@router.put("/{review_id}", response_model=schemas.Review)
def update_review(review_id: int, review: schemas.ReviewCreate, db: Session = Depends(get_db)):
    db_review = crud_reviews.update_review(db=db, review_id=review_id, review=review)
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    return db_review

@router.delete("/{review_id}", response_model=schemas.Review)
def delete_review(review_id: int, db: Session = Depends(get_db)):
    db_review = crud_reviews.delete_review(db=db, review_id=review_id)
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    return db_review
