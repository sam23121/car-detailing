from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas
from app.crud import services as crud_services

router = APIRouter()

@router.post("/", response_model=schemas.Service)
def create_service(service: schemas.ServiceCreate, db: Session = Depends(get_db)):
    return crud_services.create_service(db=db, service=service)

@router.get("/", response_model=list[schemas.Service])
def list_services(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_services.get_services(db, skip=skip, limit=limit)

@router.get("/slug/{slug}", response_model=schemas.Service)
def get_service_by_slug(slug: str, db: Session = Depends(get_db)):
    db_service = crud_services.get_service_by_slug(db, slug=slug)
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")
    return db_service

@router.get("/{service_id}", response_model=schemas.Service)
def get_service(service_id: int, db: Session = Depends(get_db)):
    db_service = crud_services.get_service(db, service_id=service_id)
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")
    return db_service

@router.put("/{service_id}", response_model=schemas.Service)
def update_service(service_id: int, service: schemas.ServiceCreate, db: Session = Depends(get_db)):
    db_service = crud_services.update_service(db=db, service_id=service_id, service=service)
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")
    return db_service

@router.delete("/{service_id}", response_model=schemas.Service)
def delete_service(service_id: int, db: Session = Depends(get_db)):
    db_service = crud_services.delete_service(db=db, service_id=service_id)
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")
    return db_service

@router.get("/{service_id}/packages", response_model=list[schemas.Package])
def get_service_packages(service_id: int, db: Session = Depends(get_db)):
    packages = crud_services.get_service_packages(db, service_id=service_id)
    if not packages:
        raise HTTPException(status_code=404, detail="No packages found for this service")
    return packages
