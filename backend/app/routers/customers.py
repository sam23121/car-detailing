from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas
from app.crud import customers as crud_customers

router = APIRouter()

@router.post("/", response_model=schemas.Customer)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    existing = crud_customers.get_customer_by_email(db, email=customer.email)
    if existing:
        return existing
    return crud_customers.create_customer(db=db, customer=customer)

@router.get("/", response_model=list[schemas.Customer])
def list_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_customers.get_customers(db, skip=skip, limit=limit)

@router.get("/{customer_id}", response_model=schemas.Customer)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    db_customer = crud_customers.get_customer(db, customer_id=customer_id)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer

@router.put("/{customer_id}", response_model=schemas.Customer)
def update_customer(customer_id: int, customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    db_customer = crud_customers.update_customer(db=db, customer_id=customer_id, customer=customer)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer

@router.delete("/{customer_id}", response_model=schemas.Customer)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    db_customer = crud_customers.delete_customer(db=db, customer_id=customer_id)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer
