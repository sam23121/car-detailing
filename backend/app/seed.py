"""Seed sample data. Run standalone: uv run python -m app.seed
   Or runs automatically on app startup if RUN_SEED_ON_STARTUP is not "false".
"""
from app.database import SessionLocal
from app import models


def run_seed():
    """Insert default services and packages (levels) if missing. Safe to call multiple times."""
    db = SessionLocal()
    try:
        # Main services only: Full detailing, Interior, Exterior, Ceramic, Paint correction, Monthly maintenance
        services_data = [
            {"name": "Full Detailing", "slug": "full-detailing", "description": "Complete interior and exterior detailing. Choose your level."},
            {"name": "Interior Detailing", "slug": "interior-detailing", "description": "Deep clean and condition your vehicle interior. Choose your level."},
            {"name": "Exterior Detailing", "slug": "exterior-detailing", "description": "Wash, polish, and protect exterior surfaces. Choose your level."},
            {"name": "Ceramic Coating", "slug": "ceramic-coating", "description": "Protective ceramic coating for your vehicle's paint."},
            {"name": "Paint Correction", "slug": "paint-correction", "description": "Professional paint correction to restore your vehicle's finish."},
            {"name": "Monthly Maintenance", "slug": "monthly-maintenance", "description": "Regular maintenance plans to keep your vehicle looking its best."},
        ]
        for data in services_data:
            if not db.query(models.Service).filter(models.Service.slug == data["slug"]).first():
                db.add(models.Service(**data))
        db.commit()

        # Packages (levels) per service. details = newline-separated bullet list for the card.
        def ensure_package(service_slug, display_order, name, description, price, duration_minutes,
                          price_small=None, price_medium=None, price_large=None,
                          price_original_small=None, price_original_medium=None, price_original_large=None,
                          turnaround_hours=None, details=None):
            svc = db.query(models.Service).filter(models.Service.slug == service_slug).first()
            if not svc:
                return
            existing = db.query(models.Package).filter(
                models.Package.service_id == svc.id,
                models.Package.name == name,
            ).first()
            if existing:
                existing.display_order = display_order
                existing.description = description
                existing.price = price
                existing.duration_minutes = duration_minutes
                existing.turnaround_hours = turnaround_hours
                if details is not None:
                    existing.details = details
                if price_small is not None:
                    existing.price_small = price_small
                    existing.price_medium = price_medium
                    existing.price_large = price_large
                    existing.price_original_small = price_original_small
                    existing.price_original_medium = price_original_medium
                    existing.price_original_large = price_original_large
                return
            kwargs = {
                "service_id": svc.id,
                "name": name,
                "description": description,
                "price": price,
                "duration_minutes": duration_minutes,
                "display_order": display_order,
                "turnaround_hours": turnaround_hours,
            }
            if details is not None:
                kwargs["details"] = details
            if price_small is not None:
                kwargs["price_small"] = price_small
                kwargs["price_medium"] = price_medium
                kwargs["price_large"] = price_large
                kwargs["price_original_small"] = price_original_small
                kwargs["price_original_medium"] = price_original_medium
                kwargs["price_original_large"] = price_original_large
            db.add(models.Package(**kwargs))

        # Full detailing: Level 1, 2, 3 – all with tiered pricing and details list
        level1_details = (
            "Vacuum floors and trunk\nWipe down vinyl/plastic and mats\nVacuum cloth seats\n"
            "Wipe leather seats\nClean console and cup holders\nClean dash with UV protect\n"
            "Clean interior trim and plastics\nClean door panels and pockets\nClean door jambs\n"
            "Clean all glass\nTwo-bucket hand wash\nHand wash wheels and tires\n"
            "Decontaminate paint\nTrim dressing\nNo-sling tire dressing\nPaint sealant (wax)"
        )
        level2_details = (
            "Everything from our Level 1 Package plus:\nClean vehicle headliner\n"
            "Shampoo cloth floor mats\nShampoo carpeting in cabin and trunk\nShampoo cloth seats\n"
            "Decontaminate with clay bar\nPet hair and sand removal if present\n"
            "Paint sealant for 3-month protection"
        )
        level3_details = (
            "Everything from Level 1 and Level 2.\nFor vehicles extremely dirty inside and out:\n"
            "Excessive staining\nPet hair and sand\nThrow-up or long-term neglect"
        )
        ensure_package("full-detailing", 0, "Level 1", "Essential interior and exterior detail.", 248.00, 150, turnaround_hours=2,
                      price_small=248, price_medium=293, price_large=338,
                      price_original_small=275, price_original_medium=325, price_original_large=375,
                      details=level1_details)
        ensure_package("full-detailing", 1, "Level 2", "Everything in Level 1 plus deeper cleaning and protection.", 293.00, 180, turnaround_hours=3,
                      price_small=293, price_medium=338, price_large=383,
                      price_original_small=325, price_original_medium=375, price_original_large=425,
                      details=level2_details)
        ensure_package("full-detailing", 2, "Level 3", "Everything from Level 1 and Level 2. For vehicles that are extremely dirty inside and out.", 473.00, 240, turnaround_hours=4,
                      price_small=473, price_medium=518, price_large=563,
                      price_original_small=525, price_original_medium=575, price_original_large=625,
                      details=level3_details)

        # Interior detailing: Level 1, 2, 3 (with details for bullet list)
        ensure_package("interior-detailing", 0, "Level 1", "Essential interior clean and protect.", 149.00, 90, turnaround_hours=1,
                      details="Vacuum and wipe all surfaces\nClean console and dash\nClean door panels and jambs\nGlass cleaning")
        ensure_package("interior-detailing", 1, "Level 2", "Deeper interior detail with conditioning.", 219.00, 120, turnaround_hours=2,
                      details="Everything in Level 1 plus:\nShampoo carpets and mats\nLeather conditioning\nHeadliner cleaning")
        ensure_package("interior-detailing", 2, "Level 3", "Full interior detail for heavily soiled vehicles.", 349.00, 180, turnaround_hours=3,
                      details="Everything in Level 1 and 2 plus:\nDeep stain removal\nPet hair removal\nFull interior sanitization")

        # Exterior detailing: Level 1, 2, 3
        ensure_package("exterior-detailing", 0, "Level 1", "Wash, wax, and basic exterior care.", 99.00, 60, turnaround_hours=1,
                      details="Two-bucket hand wash\nWheels and tires\nBasic wax application")
        ensure_package("exterior-detailing", 1, "Level 2", "Clay, polish, and sealant.", 179.00, 120, turnaround_hours=2,
                      details="Everything in Level 1 plus:\nPaint decontamination (clay)\nPolish\nSealant")
        ensure_package("exterior-detailing", 2, "Level 3", "Full exterior correction and protection.", 279.00, 180, turnaround_hours=3,
                      details="Everything in Level 1 and 2 plus:\nPaint correction\nPremium sealant or coating prep")

        # Ceramic coating: 1 year, 3 year, 5 year
        ensure_package("ceramic-coating", 0, "1 Year Ceramic Coating", "One-year ceramic coating protection.", 299.00, 240, turnaround_hours=4,
                      details="Paint preparation\nCeramic coating application\nCuring time")
        ensure_package("ceramic-coating", 1, "3 Year Ceramic Coating", "Three-year ceramic coating protection.", 499.00, 360, turnaround_hours=6,
                      details="Full decontamination\nPaint correction (as needed)\n3-year ceramic coating")
        ensure_package("ceramic-coating", 2, "5 Year Ceramic Coating", "Five-year ceramic coating protection.", 699.00, 480, turnaround_hours=8,
                      details="Full prep and correction\n5-year ceramic coating\nMultiple layers")

        # Paint correction: single package
        ensure_package("paint-correction", 0, "Paint Correction", "Professional paint correction to remove swirls and restore gloss.", 399.00, 300, turnaround_hours=5,
                      details="Wash and decontamination\nMulti-step correction\nPolish and refine\nProtection application")

        # Monthly maintenance: Biweekly, Monthly
        ensure_package("monthly-maintenance", 0, "Biweekly", "Maintenance wash and interior tidy every two weeks.", 79.00, 45, turnaround_hours=1,
                      details="Exterior wash\nInterior vacuum and wipe\nQuick detail")
        ensure_package("monthly-maintenance", 1, "Monthly", "Monthly maintenance detail to keep your vehicle in top shape.", 129.00, 90, turnaround_hours=1,
                      details="Full maintenance wash\nInterior deep tidy\nTire and trim dressing")

        db.commit()
        return len(services_data)
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
    print("Seed completed.")
