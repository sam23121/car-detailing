from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter()

@router.post("/", response_model=schemas.BlogPost)
def create_blog_post(post: schemas.BlogPostCreate, db: Session = Depends(get_db)):
    db_post = models.BlogPost(**post.model_dump())
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@router.get("/", response_model=list[schemas.BlogPost])
def list_blog_posts(skip: int = 0, limit: int = 100, published_only: bool = True, db: Session = Depends(get_db)):
    query = db.query(models.BlogPost)
    if published_only:
        query = query.filter(models.BlogPost.published == True)
    return query.offset(skip).limit(limit).all()

@router.get("/{post_id}", response_model=schemas.BlogPost)
def get_blog_post(post_id: int, db: Session = Depends(get_db)):
    db_post = db.query(models.BlogPost).filter(models.BlogPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return db_post

@router.get("/slug/{slug}", response_model=schemas.BlogPost)
def get_blog_post_by_slug(slug: str, db: Session = Depends(get_db)):
    db_post = db.query(models.BlogPost).filter(models.BlogPost.slug == slug).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return db_post

@router.put("/{post_id}", response_model=schemas.BlogPost)
def update_blog_post(post_id: int, post: schemas.BlogPostCreate, db: Session = Depends(get_db)):
    db_post = db.query(models.BlogPost).filter(models.BlogPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    for key, value in post.model_dump().items():
        setattr(db_post, key, value)
    db.commit()
    db.refresh(db_post)
    return db_post

@router.delete("/{post_id}")
def delete_blog_post(post_id: int, db: Session = Depends(get_db)):
    db_post = db.query(models.BlogPost).filter(models.BlogPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    db.delete(db_post)
    db.commit()
    return {"message": "Blog post deleted successfully"}
