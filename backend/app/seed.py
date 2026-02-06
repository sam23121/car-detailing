"""Seed sample data. Run from backend dir: uv run python -m app.seed"""
from app.database import SessionLocal
from app import models

db = SessionLocal()

try:
    services_data = [
        {"name": "Ceramic Coating", "slug": "ceramic-coating", "description": "Protective ceramic coating for your vehicle's paint."},
        {"name": "In & Out Detailing", "slug": "full-detailing", "description": "Complete interior and exterior detailing."},
        {"name": "Interior Detailing", "slug": "interior-detailing", "description": "Deep clean and condition your vehicle interior."},
        {"name": "Exterior Detailing", "slug": "exterior-detailing", "description": "Wash, polish, and protect exterior surfaces."},
        {"name": "Fleet Detailing", "slug": "fleet-detailing", "description": "Detailing services for fleets and multiple vehicles."},
        {"name": "Maintenance Detailing", "slug": "maintenance-detailing", "description": "Regular maintenance washes and touch-ups."},
    ]
    for data in services_data:
        if not db.query(models.Service).filter(models.Service.slug == data["slug"]).first():
            db.add(models.Service(**data))
    db.commit()

    # Add one package per service so the booking form has options
    packages_data = [
        ("ceramic-coating", "Full Ceramic", "Full vehicle ceramic coating.", 499.00, 240),
        ("full-detailing", "Complete In & Out", "Interior and exterior full detail.", 199.00, 180),
        ("interior-detailing", "Interior Detail", "Deep interior clean and protect.", 149.00, 120),
        ("exterior-detailing", "Exterior Detail", "Wash, clay, polish, wax.", 129.00, 90),
        ("fleet-detailing", "Per Vehicle", "Fleet detailing per vehicle.", 99.00, 60),
        ("maintenance-detailing", "Quick Maintenance", "Maintenance wash and interior tidy.", 79.00, 45),
    ]
    for slug, name, desc, price, mins in packages_data:
        svc = db.query(models.Service).filter(models.Service.slug == slug).first()
        if svc and not db.query(models.Package).filter(models.Package.service_id == svc.id).first():
            db.add(models.Package(service_id=svc.id, name=name, description=desc, price=price, duration_minutes=mins))
    db.commit()
    print("Seed completed (services + packages).")
finally:
    db.close()
