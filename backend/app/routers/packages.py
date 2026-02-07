"""Dedicated package routes to avoid path conflicts with /api/services/{id}."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas
from app.crud import services as crud_services

router = APIRouter()


@router.get("/{package_id}", response_model=schemas.PackageWithService)
def get_package_with_service(package_id: int, db: Session = Depends(get_db)):
    """Get a single package with service name/slug."""
    pkg = crud_services.get_package(db, package_id)
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
    out = schemas.PackageWithService.model_validate(pkg)
    out.service_name = pkg.service.name if pkg.service else None
    out.service_slug = pkg.service.slug if pkg.service else None
    return out
