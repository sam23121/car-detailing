"""Seed sample data. Run standalone: uv run python -m app.seed
   Or runs automatically on app startup if RUN_SEED_ON_STARTUP is not "false".
"""
from app.database import SessionLocal
from app import models


def run_seed():
    """Insert default services and packages (levels) if missing. Safe to call multiple times."""
    db = SessionLocal()
    try:
        # Package IDs still referenced by bookings (cannot delete).
        referenced_ids = {
            row[0] for row in
            db.query(models.Booking.package_id)
            .filter(models.Booking.package_id.isnot(None))
            .distinct()
            .all()
        }

        # Remove legacy "Complete" and "Full Ceramic Package" only if no booking references them.
        for name_pattern in ("%complete%", "%full ceramic package%"):
            q = db.query(models.Package).filter(models.Package.name.ilike(name_pattern))
            if referenced_ids:
                q = q.filter(~models.Package.id.in_(referenced_ids))
            for pkg in q.all():
                db.delete(pkg)
        db.commit()

        # Main services: Full detailing, Interior, Exterior, Ceramic, Paint correction, Monthly maintenance, Fleet
        services_data = [
            {"name": "Full Detailing", "slug": "full-detailing", "description": "Interior and exterior detailing. Choose your level."},
            {"name": "Interior Detailing", "slug": "interior-detailing", "description": "Deep clean and condition your vehicle interior. Choose your level."},
            {"name": "Exterior Detailing", "slug": "exterior-detailing", "description": "Wash, polish, and protect exterior surfaces. Choose your level."},
            {"name": "Ceramic Coating", "slug": "ceramic-coating", "description": "Protective ceramic coating for your vehicle's paint."},
            {"name": "Paint Correction", "slug": "paint-correction", "description": "Professional paint correction to restore your vehicle's finish."},
            {"name": "Monthly Maintenance", "slug": "monthly-maintenance", "description": "Regular maintenance plans to keep your vehicle looking its best."},
            {"name": "Fleet Detailing", "slug": "fleet-detailing", "description": "Wash and wax options for fleet vehicles. Pricing per foot."},
        ]
        for data in services_data:
            if not db.query(models.Service).filter(models.Service.slug == data["slug"]).first():
                db.add(models.Service(**data))
        db.commit()

        # Every package has Small / Medium / Large pricing (price_small, price_medium, price_large + optional originals).
        def ensure_package(service_slug, display_order, name, description, duration_minutes,
                          price_small, price_medium, price_large,
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
                existing.price = price_small
                existing.duration_minutes = duration_minutes
                existing.turnaround_hours = turnaround_hours
                existing.price_small = price_small
                existing.price_medium = price_medium
                existing.price_large = price_large
                existing.price_original_small = price_original_small
                existing.price_original_medium = price_original_medium
                existing.price_original_large = price_original_large
                if details is not None:
                    existing.details = details
                return
            db.add(models.Package(
                service_id=svc.id,
                name=name,
                description=description,
                price=price_small,
                duration_minutes=duration_minutes,
                display_order=display_order,
                turnaround_hours=turnaround_hours,
                price_small=price_small,
                price_medium=price_medium,
                price_large=price_large,
                price_original_small=price_original_small,
                price_original_medium=price_original_medium,
                price_original_large=price_original_large,
                details=details,
            ))

        # ----- Full detailing: Level 1, Level 2, Level 3 (matches frontend ServicePage.jsx) -----
        level1_details = (
            "Interior items\nComplete vacuum of floor and trunks area\nWash vinyl or rubber floor mats\n"
            "Vacuum cloth seats\nWipe down leather seats\nShampoo floor mats and carpets\n"
            "Deep clean and condition leather seat\nClean dashboard and apply UV protection\n"
            "Full wipe-down of all plastics and interior trim\n"
            "Cleaning of center console, vents, cup holders, and tight areas\n"
            "Door panels and door storage pockets cleaned and conditioned\nDoor jambs cleaned\n"
            "Interior windows and mirrors cleaned streak-free\nExterior Items\n"
            "Your vehicle will receive a careful hand wash and protective finish for a clean, glossy look.\n"
            "Gentle pre-rinse using spot-free water\nComplete hand wash using spot-free water\n"
            "Wheels, tires, and wheel wells cleaned by hand\nGas cap area cleaned\nTire dressing applied\n"
            "Paint sealant applied for shine and protection"
        )
        level2_details = (
            "What's Included\nIncludes everything in our Level 1 Detail, plus the following advanced services:\n"
            "Full shampoo extraction of cloth seats\n"
            "Steam treatment of cloth seats to sanitize and break down stains\n"
            "Deep shampoo and steam treatment of carpets in cabin and trunk\n"
            "Remove bug splatters from surfaces\n"
            "Remove environmental fallout with detailers clay from paint\n"
            "Chemically remove tar overspray and road grime\nPet hair and sand removal (if present)"
        )
        level3_details = (
            "Who This Package Is For\n"
            "This service is designed for vehicles in heavy or neglected condition that require extensive cleaning and extra labor.\n"
            "What's Included\nIncludes everything in Level 1 and Level 2, plus:\n"
            "Intensive stain treatment and extraction\nExtended pet hair removal process\nDeep interior cleaning\n"
            "Heavy exterior decontamination\nExtra labor time for severely soiled areas\n"
            "Important Notice: Final pricing is determined after in-person inspection. "
            "Vehicles with biohazard material (excessive bodily fluids, mold, etc.) may require specialized treatment and additional charges."
        )
        ensure_package("full-detailing", 0, "Level 1", "Full detailing", 270, 280, 320, 370, turnaround_hours=5, details=level1_details)
        ensure_package("full-detailing", 1, "Level 2", "Deep Full Detailing Upgrade", 330, 330, 370, 390, turnaround_hours=6, details=level2_details)
        ensure_package("full-detailing", 2, "Level 3", "Extreme Restoration", 390, 470, 520, 560, turnaround_hours=7, details=level3_details)

        # ----- Interior detailing: Level 1, Level 2, Level 3 -----
        interior_l1 = (
            "Interior items\nComplete vacuum of floor and trunks area\nWash vinyl or rubber floor mats\n"
            "Vacuum cloth seats\nWipe down leather seats\nShampoo treatment of cloth floor mats\n"
            "Deep clean and condition leather seat\nClean dashboard and apply UV protection\n"
            "Full wipe-down of all plastics and interior trim\n"
            "Cleaning of center console, vents, cup holders, and tight areas\n"
            "Door panels and door storage pockets cleaned and conditioned\nDoor jambs cleaned\n"
            "Interior windows and mirrors cleaned streak-free"
        )
        interior_l2 = (
            "Includes everything in our Level 1 Detail, plus the following advanced services:\n"
            "Deep shampoo extraction of cloth seats\n"
            "Steam treatment of cloth seats to sanitize and break down stains\n"
            "Deep shampoo and steam treatment of carpets in cabin and trunk\nPet hair and sand removal (if present)"
        )
        interior_l3 = (
            "This service is designed for vehicles in heavy soiled interior. "
            "This package includes extended labor time, extra extraction, and detailed restoration."
        )
        ensure_package("interior-detailing", 0, "Level 1", "Interior Detailing", 150, 200, 220, 250, turnaround_hours=3, details=interior_l1)
        ensure_package("interior-detailing", 1, "Level 2", "Deep interior upgrade", 165, 250, 270, 290, turnaround_hours=3, details=interior_l2)
        ensure_package("interior-detailing", 2, "Level 3", "Extreme Restoration", 225, 330, 350, 390, turnaround_hours=4, details=interior_l3)

        # ----- Exterior detailing: Level 1, Level 2, Level 3 -----
        exterior_l1 = (
            "Gentle pre-rinse using spot-free water\nComplete hand wash using spot-free water\n"
            "Wheels, tires, and wheel wells cleaned by hand\nGas cap area cleaned\nTire dressing applied\n"
            "Paint sealant applied for shine and protection\n"
            "Vacuum and wipe down vinyl or plastic floor mats\nVacuum cloth seat\nWipe down dashboard"
        )
        exterior_l2 = (
            "Includes everything in our Level 1 Detail, plus the following advanced services:\n"
            "Deep shampoo of carpets in cabin and trunk\nRemove bug splatters from surfaces\n"
            "Remove environmental fallout with detailers clay from paint\n"
            "Chemically remove tar overspray and road grime\nPet hair and sand removal (if present)\n"
            "UV protection applied to dashboard and panels"
        )
        exterior_l3 = (
            "For vehicles with heavy grime, brake dust, or long-term neglect. "
            "Add-On Service: Engine bay cleaning and dressing: $85"
        )
        ensure_package("exterior-detailing", 0, "Level 1", "Wash, Wax & Interior wipe down", 90, 140, 160, 180, turnaround_hours=2, details=exterior_l1)
        ensure_package("exterior-detailing", 1, "Level 2", "Deep Detailing Upgrade", 150, 190, 210, 230, turnaround_hours=3, details=exterior_l2)
        ensure_package("exterior-detailing", 2, "Level 3", "Extreme Restoration", 165, 280, 310, 330, turnaround_hours=3, details=exterior_l3)

        # ----- Ceramic coating: 1 year, 3 year, 5 year -----
        ceramic_benefits = (
            "Benefits of Ceramic Coating:\nProtects your vehicle's paint from UV damage and oxidation\n"
            "Maintains long-term paint condition and resale value\n"
            "Creates a hydrophobic barrier that repels water & contaminants\n"
            "Enhances gloss, depth, and color clarity for a rich, polished finish\n"
            "Reduces maintenance time & makes cleaning effortless\n"
        )
        ceramic_1y = (
            ceramic_benefits
            + "Pre-wash and 100% hand wash using spot-free water\n"
            "Thorough cleaning of wheels, wheel wells, tires, and gas cap area\n"
            "Remove bug splatters from exterior surfaces\n"
            "Remove bonded environmental fallout using a clay bar\nChemically remove tar and road grime\n"
            "Application of high-grade 1-year ceramic coating"
        )
        ceramic_3y = (
            ceramic_benefits
            + "Pre-wash and 100% hand wash using spot-free water\n"
            "Thorough cleaning of wheels, wheel wells, tires, and gas cap area\n"
            "Remove bug splatters from exterior surfaces\n"
            "Remove bonded environmental fallout using a clay bar\nChemically remove tar and road grime\n"
            "1-Step Paint Correction – removes 50–60% of light swirls\n"
            "Application of high-grade 3-year ceramic coating"
        )
        ceramic_5y = (
            ceramic_benefits
            + "Pre-wash and 100% hand wash using spot-free water\n"
            "Thorough cleaning of wheels, wheel wells, tires, and gas cap area\n"
            "Remove bug splatters from exterior surfaces\n"
            "Remove bonded environmental fallout using a clay bar\nChemically remove tar and road grime\n"
            "2-Step Paint Correction – removes 60–80% of light swirls\n"
            "Application of high-grade 5-year ceramic coating"
        )
        ensure_package("ceramic-coating", 0, "1 Year Ceramic Coating", "1 Year ceramic coating", 240, 440, 490, 540, turnaround_hours=4, details=ceramic_1y)
        ensure_package("ceramic-coating", 1, "3 Year Ceramic Coating", "3 Year ceramic coating", 360, 1100, 1200, 1300, turnaround_hours=7, details=ceramic_3y)
        ensure_package("ceramic-coating", 2, "5 Year Ceramic Coating", "5 Year ceramic coating", 540, 1200, 1300, 1400, turnaround_hours=10, details=ceramic_5y)

        # ----- Paint correction: 1 Step, 2 Step (UI price labels; DB tiers for cart/API) -----
        paint_1 = (
            "Pre-wash and 100% hand wash using spot-free water\n"
            "Thorough cleaning of wheels, wheel wells, tires, and gas cap area\n"
            "Remove bug splatters from exterior surfaces\n"
            "Remove bonded environmental fallout using a clay bar\nChemically remove tar and road grime\n"
            "1 step paint correction - remove 50 - 60% of light swirls\nUpgrade Option:\n"
            "Our professional 1-Step Paint Correction removes up to 80% of visible scratches and defects, "
            "dramatically improving gloss, clarity and overall paint appearance."
        )
        paint_2 = (
            "Pre-wash and 100% hand wash using spot-free water\n"
            "Cleaning of wheels, wheel wells, tires and gas cap area, including:\n"
            "Remove bug splatters from exterior surfaces\n"
            "Remove bonded environmental fallout using a clay bar\nChemically remove tar and road grime\n"
            "2 Step Paint Correction (remove 60-80% of light swirls)\n"
            "With our 2 step paint correction service, you can get up to 80% of scratches and defects removed "
            "based on original condition. The process requires more time and energy than the 1 step enhancement polish, "
            "but benefits from a much higher level of scratch, defect and swirl removal."
        )
        ensure_package("paint-correction", 0, "1 Step paint correction", "1 Step paint correction", 360, 600, 700, 800, turnaround_hours=7, details=paint_1)
        ensure_package("paint-correction", 1, "2 Step paint correction", "2 Step paint correction", 570, 800, 1000, 1200, turnaround_hours=10, details=paint_2)

        # ----- Monthly maintenance: Biweekly, Monthly -----
        biweekly_details = (
            "Interior Maintenance\nComplete vacuum of carpets and trunk area\nWipe-down of vinyl or rubber floor mats\n"
            "Vacuum cloth seats\nLeather seat wipe-down and conditioning\nDashboard cleaning with UV protection\n"
            "Cleaning of console, cup holders, vents, and tight areas\nWipe-down of interior trim and plastics\n"
            "Door jamb cleaning\nInterior and exterior glass cleaned streak-free\n"
            "Protective treatment applied to leather and vinyl surfaces\nExterior Maintenance\n"
            "Pre-rinse using spot-free water\nComplete hand wash using spot-free water\n"
            "Wheels and tires cleaned by hand\nTrim dressing applied\nNo-sling tire shine\n"
            "Paint sealant application to maintain gloss and protection"
        )
        monthly_details = (
            "Interior Maintenance\nFull vacuum of carpets and trunk\nLight wipe-down of floor mats (vinyl/rubber)\n"
            "Vacuum cloth seats\nWipe down leather seats\nLeather seat conditioning treatment\n"
            "Clean dashboard and apply UV protection\n"
            "Detailed wipe-down of trim, panels, console, vents, and cup holders\nDoor jamb light wipe down\n"
            "Interior and exterior glass cleaning\nProtective treatment applied to leather and vinyl surfaces\n"
            "Exterior Maintenance\nPre-rinse using spot-free water\nComplete hand wash using spot-free water\n"
            "Wheels and tires cleaned by hand\nNo-sling tire shine\n"
            "Paint sealant applied to maintain protection and gloss\n"
            "Important Notes: The vehicle must first get full detailing by our team and be maintained on a 4-week schedule "
            "to qualify for maintenance pricing. Excessive buildup, heavy pet hair, or severe staining may require upgrade "
            "to a higher-level detail."
        )
        ensure_package("monthly-maintenance", 0, "Biweekly", "Biweekly maintenance", 150, 350, 370, 395, turnaround_hours=2, details=biweekly_details)
        ensure_package("monthly-maintenance", 1, "Monthly", "1 month maintenance", 165, 150, 175, 190, turnaround_hours=3, details=monthly_details)

        # ----- Fleet detailing: Wash & Spray Wax, Wash & Hand Wax (price per foot, frontend shows custom copy) -----
        ensure_package("fleet-detailing", 0, "Wash & Spray Wax", "Wash and spray wax. Pricing per foot.", 60, 15, 15, 15, 15, 15, 15, turnaround_hours=1,
                      details="Wash and spray wax")
        ensure_package("fleet-detailing", 1, "Wash & Hand Wax", "Wash and hand wax. Pricing per foot.", 120, 35, 35, 35, 35, 35, 35, turnaround_hours=2,
                      details="Wash and hand wax")

        db.commit()
        return len(services_data)
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
    print("Seed completed.")
