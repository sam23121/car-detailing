"""Seed sample data. Run standalone: uv run python -m app.seed
   Or runs automatically on app startup if RUN_SEED_ON_STARTUP is not "false".
"""
from app.database import SessionLocal
from app import models


def run_seed():
    """Insert default services and packages if missing. Safe to call multiple times."""
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

        packages_data = [
            ("ceramic-coating", "Full Ceramic", "Full vehicle ceramic coating.", 499.00, 240),
            ("full-detailing", "Complete In & Out", "Interior and exterior full detail.", 199.00, 180),
            ("interior-detailing", "Interior Detail", "Deep interior clean and protect.", 149.00, 120),
            ("exterior-detailing", "Exterior Detail", "Wash, clay, polish, wax.", 129.00, 90),
            ("fleet-detailing", "Per Vehicle", "Fleet detailing per vehicle.", 99.00, 60),
            ("maintenance-detailing", "Quick Maintenance", "Maintenance wash and interior tidy.", 79.00, 45),
        ]
        added = 0
        for slug, name, desc, price, mins in packages_data:
            svc = db.query(models.Service).filter(models.Service.slug == slug).first()
            if not svc:
                continue
            existing = db.query(models.Package).filter(
                models.Package.service_id == svc.id,
                models.Package.name == name,
            ).first()
            if not existing:
                db.add(models.Package(service_id=svc.id, name=name, description=desc, price=price, duration_minutes=mins))
                added += 1
        db.commit()
        return added
    finally:
        db.close()


if __name__ == "__main__":
    n = run_seed()
    print(f"Seed completed. Packages added: {n}.")
