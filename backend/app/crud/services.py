from sqlalchemy.orm import Session
from app import models, schemas

def create_service(db: Session, service: schemas.ServiceCreate):
    db_service = models.Service(**service.model_dump())
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

def get_service(db: Session, service_id: int):
    return db.query(models.Service).filter(models.Service.id == service_id).first()

def get_service_by_slug(db: Session, slug: str):
    return db.query(models.Service).filter(models.Service.slug == slug).first()

def get_services(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Service).offset(skip).limit(limit).all()

def update_service(db: Session, service_id: int, service: schemas.ServiceCreate):
    db_service = get_service(db, service_id)
    if db_service:
        for key, value in service.model_dump().items():
            setattr(db_service, key, value)
        db.commit()
        db.refresh(db_service)
    return db_service

def delete_service(db: Session, service_id: int):
    db_service = get_service(db, service_id)
    if db_service:
        db.delete(db_service)
        db.commit()
    return db_service

def get_service_packages(db: Session, service_id: int):
    return db.query(models.Package).filter(models.Package.service_id == service_id).all()
