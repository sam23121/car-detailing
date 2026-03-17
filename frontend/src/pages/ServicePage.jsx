import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';
import { BUSINESS } from '../config';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { resolvePackageImage } from '../lib/images';
import { getServiceDisplayName } from '../lib/services';
import './ServicePage.css';

/** Exterior Detailing: custom content per level. No booking after 4PM. */
const EXTERIOR_LEVELS = {
  'Level 1': {
    subtitle: 'Wash, Wax & Interior wipe down',
    turnaround: '1-2 Hours',
    prices: { small: 140, medium: 160, large: 180 },
    items: [
      'Gentle pre-rinse using spot-free water',
      'Complete hand wash using spot-free water',
      'Wheels, tires, and wheel wells cleaned by hand',
      'Gas cap area cleaned',
      'Tire dressing applied',
      'Paint sealant applied for shine and protection',
      'Vacuum and wipe down vinyl or plastic floor mats',
      'Vacuum cloth seat',
      'Wipe down dashboard',
    ],
  },
  'Level 2': {
    subtitle: 'Deep Detailing Upgrade',
    turnaround: '2-2.5 Hours',
    prices: { small: 190, medium: 210, large: 230 },
    items: [
      'Includes everything in our Level 1 Detail, plus the following advanced services:',
      'Deep shampoo of carpets in cabin and trunk',
      'Remove bug splatters from surfaces',
      'Remove environmental fallout with detailers clay from paint',
      'Chemically remove tar overspray and road grime',
      'Pet hair and sand removal (if present)',
      'UV protection applied to dashboard and panels',
    ],
  },
  'Level 3': {
    subtitle: 'Extreme Restoration',
    turnaround: '2-3 Hours',
    prices: { small: 280, medium: 310, large: 330 },
    items: [],
    note: 'For vehicles with heavy grime, brake dust, or long-term neglect. Add-On Service: Engine bay cleaning and dressing: $85',
  },
};

/** Interior Detailing: custom content per level. No booking after 4PM. */
const INTERIOR_LEVELS = {
  'Level 1': {
    subtitle: 'Interior Detailing',
    turnaround: '2-2.5 Hours',
    prices: { small: 200, medium: 220, large: 250 },
    items: [
      'Interior items',
      'Complete vacuum of floor and trunks area',
      'Wash vinyl or rubber floor mats',
      'Vacuum cloth seats',
      'Wipe down leather seats',
      'Shampoo treatment of cloth floor mats',
      'Deep clean and condition leather seat',
      'Clean dashboard and apply UV protection',
      'Full wipe-down of all plastics and interior trim',
      'Cleaning of center console, vents, cup holders, and tight areas',
      'Door panels and door storage pockets cleaned and conditioned',
      'Door jambs cleaned',
      'Interior windows and mirrors cleaned streak-free',
    ],
  },
  'Level 2': {
    turnaround: '2.5-3 Hours',
    prices: { small: 250, medium: 270, large: 290 },
    items: [
      'Includes everything in our Level 1 Detail, plus the following advanced services:',
      'Deep shampoo extraction of cloth seats',
      'Steam treatment of cloth seats to sanitize and break down stains',
      'Deep shampoo and steam treatment of carpets in cabin and trunk',
      'Pet hair and sand removal (if present)',
    ],
  },
  'Level 3': {
    subtitle: 'Extreme Restoration',
    turnaround: '3-4 Hours',
    prices: { small: 330, medium: 350, large: 390 },
    items: [],
    note: 'This service is designed for vehicles in heavy soiled interior. This package includes extended labor time, extra extraction, and detailed restoration.',
  },
};

/** Full Detailing: custom content per level, shown inside package cards (from services.md) */
const FULL_DETAILING_LEVEL_1_ITEMS = [
  'Interior items',
  'Complete vacuum of floor and trunks area',
  'Wash vinyl or rubber floor mats',
  'Vacuum cloth seats',
  'Wipe down leather seats',
  'Shampoo of carpets floor mat',
  'Deep clean and condition leather seat',
  'Clean dashboard and apply UV protection',
  'Full wipe-down of all plastics and interior trim',
  'Cleaning of center console, vents, cup holders, and tight areas',
  'Door panels and door storage pockets cleaned and conditioned',
  'Door jambs cleaned',
  'Interior windows and mirrors cleaned streak-free',
  'Exterior Items',
  'Your vehicle will receive a careful hand wash and protective finish for a clean, glossy look.',
  'Gentle pre-rinse using spot-free water',
  'Complete hand wash using spot-free water',
  'Wheels, tires, and wheel wells cleaned by hand',
  'Gas cap area cleaned',
  'Tire dressing applied',
  'Paint sealant applied for shine and protection',
];

const FULL_DETAILING_LEVEL_2_ITEMS = [
  'What\'s Included',
  'Includes everything in our Level 1 Detail, plus the following advanced services:',
  'Full shampoo extraction of cloth seats',
  'Steam treatment of cloth seats to sanitize and break down stains',
  'Deep shampoo and steam treatment of carpets in cabin and trunk',
  'Remove bug splatters from surfaces',
  'Remove environmental fallout with detailers clay from paint',
  'Chemically remove tar overspray and road grime',
  'Pet hair and sand removal (if present)',
];

const FULL_DETAILING_LEVEL_3_ITEMS = [
  'Who This Package Is For',
  'This service is designed for vehicles in heavy or neglected condition that require extensive cleaning and extra labor.',
  'What\'s Included',
  'Includes everything in Level 1 and Level 2, plus:',
  'Intensive stain treatment and extraction',
  'Extended pet hair removal process',
  'Deep interior cleaning',
  'Heavy exterior decontamination',
  'Extra labor time for severely soiled areas',
];

/** Full Detailing. No booking after 1PM. */
const FULL_DETAILING_LEVELS = {
  'Level 1': {
    subtitle: 'Full detailing',
    turnaround: '4-5 Hours',
    prices: { small: 280, medium: 320, large: 370 },
    items: FULL_DETAILING_LEVEL_1_ITEMS,
  },
  'Level 2': {
    subtitle: 'Deep Full Detailing Upgrade',
    turnaround: '4-6 Hours',
    prices: { small: 330, medium: 370, large: 390 },
    items: FULL_DETAILING_LEVEL_2_ITEMS,
  },
  'Level 3': {
    subtitle: 'Extreme Restoration',
    turnaround: '5-7 Hours',
    prices: { small: 470, medium: 520, large: 560 },
    items: FULL_DETAILING_LEVEL_3_ITEMS,
    note: 'Important Notice: Final pricing is determined after in-person inspection. Vehicles with biohazard material (excessive bodily fluids, mold, etc.) may require specialized treatment and additional charges.',
  },
};

/** Monthly Maintenance: custom content per package (from services.md). API package names: "Monthly", "Biweekly". */
const MAINTENANCE_MONTHLY_ITEMS = [
  'Interior Maintenance',
  'Full vacuum of carpets and trunk',
  'Light wipe-down of floor mats (vinyl/rubber)',
  'Vacuum cloth seats',
  'Wipe down leather seats',
  'Leather seat conditioning treatment',
  'Clean dashboard and apply UV protection',
  'Detailed wipe-down of trim, panels, console, vents, and cup holders',
  'Door jamb light wipe down',
  'Interior and exterior glass cleaning',
  'Protective treatment applied to leather and vinyl surfaces',
  'Exterior Maintenance',
  'Pre-rinse using spot-free water',
  'Complete hand wash using spot-free water',
  'Wheels and tires cleaned by hand',
  'No-sling tire shine',
  'Paint sealant applied to maintain protection and gloss',
];

const MAINTENANCE_BIWEEKLY_ITEMS = [
  'Interior Maintenance',
  'Complete vacuum of carpets and trunk area',
  'Wipe-down of vinyl or rubber floor mats',
  'Vacuum cloth seats',
  'Leather seat wipe-down and conditioning',
  'Dashboard cleaning with UV protection',
  'Cleaning of console, cup holders, vents, and tight areas',
  'Wipe-down of interior trim and plastics',
  'Door jamb cleaning',
  'Interior and exterior glass cleaned streak-free',
  'Protective treatment applied to leather and vinyl surfaces',
  'Exterior Maintenance',
  'Pre-rinse using spot-free water',
  'Complete hand wash using spot-free water',
  'Wheels and tires cleaned by hand',
  'Trim dressing applied',
  'No-sling tire shine',
  'Paint sealant application to maintain gloss and protection',
];

/** Monthly Maintenance. No booking after 4PM. Biweekly hidden for now. */
const MAINTENANCE_PACKAGES = {
  'Monthly': {
    subtitle: '1 month maintenance',
    turnaround: '2-3 Hours',
    prices: { small: 150, medium: 175, large: 210 },
    items: MAINTENANCE_MONTHLY_ITEMS,
    note: 'Important Notes: The vehicle must first get full detailing by our team and be maintained on a 4-week schedule to qualify for maintenance pricing. Excessive buildup, heavy pet hair, or severe staining may require upgrade to a higher-level detail.',
  },
  'Biweekly': {
    subtitle: 'Biweekly',
    prices: { small: 350, medium: 370, large: 395 },
    items: MAINTENANCE_BIWEEKLY_ITEMS,
    note: 'Important Notes: Biweekly pricing applies to vehicles maintained on a consistent two-week schedule. The vehicle must first get full detailing by our team to qualify for maintenance pricing. Vehicles with excessive buildup, staining, or heavy contamination may require a higher-level detail before starting maintenance.',
  },
};

/** Ceramic Coating: custom content per package (from services.md). Benefits + per-package items. */
const CERAMIC_BENEFITS = [
  'Benefits of Ceramic Coating:',
  'Protects your vehicle\'s paint from UV damage and oxidation',
  'Maintains long-term paint condition and resale value',
  'Creates a hydrophobic barrier that repels water & contaminants',
  'Enhances gloss, depth, and color clarity for a rich, polished finish',
  'Reduces maintenance time & makes cleaning effortless',
];

const CERAMIC_1YEAR_ITEMS = [
  ...CERAMIC_BENEFITS,
  'Pre-wash and 100% hand wash using spot-free water',
  'Thorough cleaning of wheels, wheel wells, tires, and gas cap area',
  '2-Step Paint Correction – removes 60–80% of light swirls',
  'Application of high-grade 1-year ceramic coating',
];

const CERAMIC_3YEAR_ITEMS = [
  ...CERAMIC_BENEFITS,
  'Pre-wash and 100% hand wash using spot-free water',
  'Thorough cleaning of wheels, wheel wells, tires, and gas cap area',
  '2-Step Paint Correction – removes 60–80% of light swirls',
  'Application of high-grade 3-year ceramic coating',
];

const CERAMIC_5YEAR_ITEMS = [
  ...CERAMIC_BENEFITS,
  'Pre-wash and 100% hand wash using spot-free water',
  'Thorough cleaning of wheels, wheel wells, tires, and gas cap area',
  '2-Step Paint Correction – removes 60–80% of light swirls',
  'Application of high-grade 5-year ceramic coating',
];

/** Ceramic Coating. No booking after 10AM. */
const CERAMIC_PACKAGES = {
  '1 Year Ceramic Coating': {
    subtitle: '1 Year ceramic coating',
    turnaround: '3-4 Hours',
    prices: { small: 300, medium: 350, large: 390 },
    items: CERAMIC_1YEAR_ITEMS,
  },
  '3 Year Ceramic Coating': {
    subtitle: '3 Year ceramic coating',
    turnaround: '5-7 Hours',
    prices: { small: 1000, medium: 1100, large: 1200 },
    items: CERAMIC_3YEAR_ITEMS,
  },
  '5 Year Ceramic Coating': {
    subtitle: '5 Year ceramic coating',
    turnaround: '8-10 Hours',
    prices: { small: 1100, medium: 1200, large: 1300 },
    items: CERAMIC_5YEAR_ITEMS,
  },
};

/** Paint Correction: custom content per package (from services.md). API names: "1 Step paint correction", "2 Step paint correction". */
const PAINT_CORRECTION_1STEP_ITEMS = [
  'Pre-wash and 100% hand wash using spot-free water',
  'Thorough cleaning of wheels, wheel wells, tires, and gas cap area',
  '2-Step Paint Correction – removes 60–80% of light swirls',
  'Upgrade Option:',
  'Our professional 2-Step Paint Correction removes up to 80% of visible scratches and defects, dramatically improving gloss, clarity and overall paint appearance.',
];

const PAINT_CORRECTION_2STEP_ITEMS = [
  'Pre-wash and 100% hand wash using spot-free water',
  'Cleaning of wheels, wheel wells, tires and gas cap area',
  '2 Step Paint Correction (remove 80-90% of light swirls)',
  'With our 2 step paint correction service, you can get up to 80% of scratches and defects removed based on original condition. The process requires more time and energy than the 1 step enhancement polish, but benefits from a much higher level of scratch, defect and swirl removal.',
  'AVERAGE CAR, USED CAR, DAILY DRIVEN USE, NEGLECTED PAINT',
];

/** Paint Correction. No booking after 10AM. */
const PAINT_CORRECTION_PACKAGES = {
  '1 Step paint correction': {
    subtitle: '1 Step paint correction',
    turnaround: '5-7 Hours',
    priceLabel: 'Start from $600',
    prices: { small: 500, medium: 600, large: 700 },
    items: PAINT_CORRECTION_1STEP_ITEMS,
  },
  '2 Step paint correction': {
    subtitle: '2 Step paint correction',
    turnaround: '9-10 Hours',
    priceLabel: 'Start from $800',
    prices: { small: 1000, medium: 1200, large: 1300 },
    items: PAINT_CORRECTION_2STEP_ITEMS,
  },
};

const VEHICLE_SIZES = [
  { key: 'small', label: 'Small Coupe/Sedans', priceKey: 'price_small', originalKey: 'price_original_small' },
  { key: 'medium', label: 'Medium SUV/Truck (4-5 seats)', priceKey: 'price_medium', originalKey: 'price_original_medium' },
  { key: 'large', label: 'Minivan/Van (6-8 seats)', priceKey: 'price_large', originalKey: 'price_original_large' },
];

function ServicePage() {
  const { slug } = useParams();
  const { items: cartItems, addItem } = useCart();
  const { showToast } = useToast();
  const [service, setService] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSizeByPkg, setSelectedSizeByPkg] = useState({});

  useEffect(() => {
    const fetch = async () => {
      try {
        const serviceRes = await axios.get(`${API_BASE}/api/services/slug/${slug}`);
        setService(serviceRes.data);
        const pkgRes = await axios.get(`${API_BASE}/api/services/${serviceRes.data.id}/packages`);
        // Do not show "Complete" or other legacy packages; for level-based services only show allowed names
        const levelSlugs = ['full-detailing', 'interior-detailing', 'exterior-detailing'];
        const levelNames = ['Level 1', 'Level 2', 'Level 3'];
        const exteriorNames = ['Level 1', 'Level 2', 'Level 3', 'Engine bay cleaning'];
        const ceramicNames = ['1 Year Ceramic Coating', '3 Year Ceramic Coating', '5 Year Ceramic Coating'];
        const list = (pkgRes.data || []).filter((p) => {
          if (!p?.name) return false;
          if (p.name.toLowerCase().includes('complete')) return false;
          if (slug === 'monthly-maintenance' && p.name.trim() === 'Biweekly') return false;
          if (slug === 'exterior-detailing' && !exteriorNames.includes(p.name.trim())) return false;
          if (slug === 'ceramic-coating' && !ceramicNames.includes(p.name.trim())) return false;
          if (slug !== 'exterior-detailing' && slug !== 'ceramic-coating' && levelSlugs.includes(slug) && !levelNames.includes(p.name.trim())) return false;
          return true;
        });
        setPackages(list);
      } catch (err) {
        setError('Service not found');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetch();
  }, [slug]);

  const setSizeForPkg = (pkgId, size) => {
    setSelectedSizeByPkg((prev) => ({ ...prev, [pkgId]: size }));
  };

  const hasTieredPricing = (pkg) =>
    pkg && (pkg.price_small != null || pkg.price_medium != null || pkg.price_large != null);

  const getCustomLevels = () => {
    if (slug === 'full-detailing') return FULL_DETAILING_LEVELS;
    if (slug === 'exterior-detailing') return EXTERIOR_LEVELS;
    if (slug === 'interior-detailing') return INTERIOR_LEVELS;
    if (slug === 'monthly-maintenance') return MAINTENANCE_PACKAGES;
    if (slug === 'ceramic-coating') return CERAMIC_PACKAGES;
    if (slug === 'paint-correction') return PAINT_CORRECTION_PACKAGES;
    return null;
  };

  const getPriceForPkg = (pkg, sizeKey) => {
    if (!pkg) return null;
    const levels = getCustomLevels();
    if (levels && pkg.name) {
      const data = levels[pkg.name.trim()];
      if (data?.pricePerFoot != null) return data.pricePerFoot;
      if (data?.prices && data.prices[sizeKey] != null) return data.prices[sizeKey];
    }
    const priceKey = sizeKey === 'small' ? 'price_small' : sizeKey === 'medium' ? 'price_medium' : 'price_large';
    const price = pkg[priceKey] ?? pkg.price;
    return price;
  };

  const turnaround = (pkg) => {
    if (!pkg) return null;
    const levels = getCustomLevels();
    if (levels && pkg.name) {
      const data = levels[pkg.name.trim()];
      if (data?.turnaround) return data.turnaround;
    }
    if (pkg.turnaround_hours != null) return `${pkg.turnaround_hours} HOUR${pkg.turnaround_hours !== 1 ? 'S' : ''}`;
    if (pkg.duration_minutes) {
      const h = Math.round(pkg.duration_minutes / 60);
      return `${h} HOUR${h !== 1 ? 'S' : ''}`;
    }
    return null;
  };

  /** Turn description/details into bullet items (split on newlines or use as single item). */
  const serviceListItems = (pkg) => {
    const levels = getCustomLevels();
    if (levels && pkg.name) {
      const data = levels[pkg.name.trim()];
      if (data) {
        const list = [...(data.items || [])];
        if (data.note) list.push(data.note);
        return list;
      }
    }
    const parts = [];
    if (pkg.description) parts.push(pkg.description);
    if (pkg.details) {
      const lines = pkg.details.split(/\n/).map((s) => s.trim()).filter(Boolean);
      parts.push(...lines);
    }
    return parts.length ? parts : [];
  };

  const getLevelCardTitle = (pkg) => {
    const levels = getCustomLevels();
    if (!levels || !pkg.name) return pkg.name.toUpperCase();
    const data = levels[pkg.name.trim()];
    if (data?.subtitle) return `${pkg.name.toUpperCase()} (${data.subtitle})`;
    return pkg.name.toUpperCase();
  };

  const handleScheduleNow = (pkg) => {
    const sizeKey = selectedSizeByPkg[pkg.id] ?? 'small';
    const price = getPriceForPkg(pkg, sizeKey);
    if (price == null) {
      showToast('Please select vehicle size');
      return;
    }
    if (cartItems.some((i) => i.id === pkg.id && i.vehicleSize === sizeKey)) {
      showToast('Already in your booking');
      return;
    }
    const fullSizeLabel = VEHICLE_SIZES.find((s) => s.key === sizeKey);
    const name = fullSizeLabel ? `${pkg.name} (${fullSizeLabel.label})` : pkg.name;
    addItem({
      id: pkg.id,
      name,
      price,
      service_name: service?.name || '',
      vehicleSize: sizeKey,
    });
    showToast('Added to booking. We accept payment in person.');
  };

  const inCart = (pkg) => {
    const sizeKey = selectedSizeByPkg[pkg.id] ?? 'small';
    return cartItems.some((i) => i.id === pkg.id && i.vehicleSize === sizeKey);
  };

  if (loading) return <div className="service-page loading">Loading...</div>;
  if (error || !service) {
    return (
      <main className="service-page">
        <div className="service-container">
          <p>{error || 'Service not found'}</p>
          <Link to="/book">Back to services</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="service-page">
      <div className="service-container">
        <Link to="/book" className="back-link back-link-top">← Back to services</Link>
        <h1>{getServiceDisplayName(service)}</h1>
        {service.description && (
          <div className="service-detail-block">
            <p className="service-desc">{service.description}</p>
          </div>
        )}

        <div className="packages-section">
          <h2>Choose a level</h2>
          {packages.length === 0 ? (
            <p>No packages for this service yet. <Link to="/booking">Request a quote</Link>.</p>
          ) : (
            <div className="service-levels-list">
              {packages.map((pkg, index) => {
                const sizeKey = selectedSizeByPkg[pkg.id] ?? 'small';
                // "Most popular" is Level 2 (by name or display_order), not by array index
                const isPopular = (pkg.name && pkg.name.trim().toLowerCase() === 'level 2') || pkg.display_order === 1;
                const items = serviceListItems(pkg);
                return (
                  <article key={pkg.id} className="service-level-block">
                    {isPopular && <span className="service-level-badge">Most popular</span>}
                    <div className={`service-level-inner ${index % 2 === 1 ? 'service-level-inner--reverse' : ''}`}>
                      <div className="service-level-image-wrap">
                        <img src={resolvePackageImage(pkg, service)} alt={pkg.name} />
                      </div>
                      <div className="service-level-content">
                        <h3 className="service-level-title">{getLevelCardTitle(pkg)} PACKAGE</h3>

                        <div className="service-level-price-boxes">
                            {(() => {
                              const levels = getCustomLevels();
                              const data = levels && pkg.name ? levels[pkg.name.trim()] : null;
                              if (data?.priceLabel) {
                                return (
                                  <p className="service-level-price-single">{data.priceLabel}</p>
                                );
                              }
                              return VEHICLE_SIZES.map((size) => {
                                const p = getPriceForPkg(pkg, size.key);
                                if (p == null) return null;
                                return (
                                  <button
                                    type="button"
                                    key={size.key}
                                    className={`service-level-price-box ${sizeKey === size.key ? 'selected' : ''}`}
                                    onClick={() => setSizeForPkg(pkg.id, size.key)}
                                  >
                                    <span className="service-level-price-label">
                                      {size.label} – ${Number(p).toFixed(0)}
                                    </span>
                                  </button>
                                );
                              });
                            })()}
                          </div>

                        {turnaround(pkg) && (
                          <p className="service-level-turnaround">TURNAROUND: {turnaround(pkg)}</p>
                        )}

                        {items.length > 0 && (
                          <ul className="service-level-list">
                            {items.map((line, i) => {
                              const isSectionHeading = /^(Interior|Exterior)\s+(Items?|Maintenance)(\s|$)/i.test(String(line).trim()) || /^What's Included$|^Who This Package Is For$|^Upgrade Option:?$|^Benefits of Ceramic Coating:?$/i.test(String(line).trim());
                              return (
                                <li key={i} className={isSectionHeading ? 'service-level-list-heading' : ''}>
                                  {line}
                                </li>
                              );
                            })}
                          </ul>
                        )}

                        <div className="service-level-actions">
                          <a href={`sms:${BUSINESS.phone.replace(/\D/g, '').replace(/^(\d{10})$/, '+1$1')}`} className="btn service-level-btn-call">
                            TEXT NOW
                          </a>
                          <button
                            type="button"
                            className="btn service-level-btn-schedule"
                            onClick={() => handleScheduleNow(pkg)}
                            disabled={inCart(pkg)}
                          >
                            {inCart(pkg) ? 'IN BOOKING' : 'SCHEDULE NOW'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
        <Link to="/book" className="back-link">← Back to services</Link>
      </div>
    </main>
  );
}

export default ServicePage;
