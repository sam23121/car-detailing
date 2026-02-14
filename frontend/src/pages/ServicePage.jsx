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

/** Exterior Detailing: custom content per level, shown inside package cards */
const EXTERIOR_LEVELS = {
  'Level 1': {
    subtitle: 'Wash, wax & interior wipe down',
    prices: { small: 130, medium: 150, large: 150 },
    items: [
      'Pre-wash with spot free water',
      'Contact 100% hand wash with spot-free water',
      'Hand wash wheels, wheel well and tires',
      'Gas cap cleaning',
      'Apply tire dressing',
      'Vacuum and wipe down vinyl or plastic floor mats',
      'Vacuum cloth seat',
      'Wipe down dashboard',
    ],
  },
  'Level 2': {
    prices: { small: 140, medium: 150, large: 160 },
    items: [
      'Everything from our Level 1 Package plus these upgrades:',
      'Iron removal treatment',
      'Decontaminate paint to remove bugs/tar/grime',
      'Apply paint sealant (wax)',
    ],
  },
  'Level 3': {
    prices: { small: 160, medium: 170, large: 190 },
    items: [],
    note: 'This package is for vehicles that are extremely dirty from the outside.',
  },
};

/** Interior Detailing: custom content per level, shown inside package cards */
const INTERIOR_LEVELS = {
  'Level 1': {
    prices: { small: 150, medium: 180, large: 190 },
    items: [
      'Vacuum floors and trunk area',
      'Wash vinyl or plastic floor mats',
      'Vacuum cloth seats',
      'Wipe leather seats down',
      'Clean console, cup holders, crevices, and vents',
      'Clean dash and UV protect',
      'Clean all interior trim and plastics',
      'Clean and condition door panels and pockets',
      'Clean door jambs',
      'Clean glass inside and out',
      'Deep clean and condition leather seats',
      'Apply protective treatment to leather and vinyl',
    ],
  },
  'Level 2': {
    prices: { small: 220, medium: 230, large: 240 },
    items: [
      'Everything from our Level 1 Package plus these upgrades:',
      'Clean vehicle headliner',
      'Shampoo cloth floor mats',
      'Shampoo carpeting in cabin and trunk',
      'Shampoo cloth seats',
      'Decontaminate remaining impurities with clay-bar',
      'Pet hair and sand removal if present',
    ],
  },
  'Level 3': {
    prices: { small: 300, medium: 350, large: 390 },
    items: [],
    note: 'This package is for vehicles that are extremely dirty from the inside. This includes excessive staining, dog hair, sand, throw up or if the vehicle hasn\'t been washed in years.',
  },
};

/** Full Detailing: custom content per level, shown inside package cards */
const FULL_DETAILING_LEVEL_1_ITEMS = [
  'Interior items:',
  'Vacuum floors and trunk area',
  'Shampoo cloth floor mats',
  'Vacuum cloth seats',
  'Wipe leather seats down',
  'Clean console, cup holders, crevices, and vents',
  'Clean dash and UV protect',
  'Clean all interior trim and plastics',
  'Clean and condition door panels and pockets',
  'Clean door jambs',
  'Clean glass inside and out',
  'Deep clean and condition leather seats',
  'Apply protective treatment to leather and vinyl',
  'Exterior items:',
  'Pre-wash with spot free water',
  'Contact 100% hand wash with spot-free water',
  'Hand wash wheels, wheel well and tires',
  'Gas cap cleaning',
  'Decontaminate paint to remove minor bugs/tar/grime',
  'Apply trim dressing',
  'Apply no-sling tire dressing',
  'Apply paint sealant (wax)',
];

const FULL_DETAILING_LEVEL_2_ITEMS = [
  'Everything from our Level 1 Package plus these upgrades:',
  'Clean vehicle headliner',
  'Shampoo carpeting in cabin and trunk',
  'Shampoo cloth seats',
  'Decontaminate remaining impurities with clay-bar',
  'Pet hair and sand removal if present',
];

const FULL_DETAILING_LEVELS = {
  'Level 1': {
    prices: { small: 280, medium: 325, large: 370 },
    items: FULL_DETAILING_LEVEL_1_ITEMS,
  },
  'Level 2': {
    prices: { small: 330, medium: 370, large: 390 },
    items: FULL_DETAILING_LEVEL_2_ITEMS,
  },
  'Level 3': {
    items: [],
    note: 'This package is for vehicles that are extremely dirty from the inside and outside. This includes excessive staining, dog hair, sand, throw up or if the vehicle hasn\'t been washed in years.',
  },
};

/** Monthly Maintenance: custom content per package, shown inside package cards (API package names: "Monthly", "Biweekly") */
const MAINTENANCE_SHARED_ITEMS = [
  'Interior Items:',
  'Vacuum floors and trunk area',
  'Wipe down vinyl or plastic floor mats',
  'Vacuum cloth seats',
  'Wipe leather seats down',
  'Clean console, cup holders, crevices, and vents',
  'Clean dash and UV protect',
  'Clean all interior trim and plastics',
  'Clean and condition door panels and pockets',
  'Clean door jambs',
  'Clean glass inside and out',
  'Deep clean and condition leather seats',
  'Apply protective treatment to leather and vinyl',
  'Exterior Items:',
  'Two bucket hand wash',
  'Hand wash wheels and tires',
  'Apply trim dressing',
  'Apply no-sling tire dressing',
  'Apply paint sealant (wax)',
];

const MAINTENANCE_PACKAGES = {
  'Monthly': {
    subtitle: '1 month maintenance',
    prices: { small: 150, medium: 175, large: 210 },
    items: MAINTENANCE_SHARED_ITEMS,
  },
  'Biweekly': {
    prices: { small: 350, medium: 370, large: 395 },
    items: MAINTENANCE_SHARED_ITEMS,
  },
};

/** Ceramic Coating: custom content per package (API names: "1 Year Ceramic Coating", "3 Year Ceramic Coating", "5 Year Ceramic Coating") */
const CERAMIC_1YEAR_ITEMS = [
  'Pre-wash and 100% hand wash using spot-free water',
  'Cleaning of wheels, wheel well, tires and gas cap area',
  '1 Step Paint Correction (remove 40-60% of light swirls)',
  'High grade 1 year Ceramic Coating',
  'Protect your vehicle\'s paint from UV rays and oxidation',
  'Repel water, dirt, and road contaminants',
  'Enhance gloss, depth, and color clarity',
  'Make maintenance and washing easier',
];

const CERAMIC_3YEAR_ITEMS = [
  'Pre-wash and 100% hand wash using spot-free water',
  'Cleaning of wheels, wheel well, tires and gas cap area',
  '2 Step Paint Correction (remove 80-90% of light swirls)',
  'High grade 3 year Ceramic Coating',
  'Protect your vehicle\'s paint from UV rays and oxidation',
  'Repel water, dirt, and road contaminants',
  'Enhance gloss, depth, and color clarity',
  'Make maintenance and washing easier',
];

const CERAMIC_5YEAR_ITEMS = [
  'Pre-wash and 100% hand wash using spot-free water',
  'Cleaning of wheels, wheel well, tires and gas cap area',
  '2 Step Paint Correction (remove 80-90% of light swirls)',
  'High grade 5 year Ceramic Coating',
  'Protect your vehicle\'s paint from UV rays and oxidation',
  'Repel water, dirt, and road contaminants',
  'Enhance gloss, depth, and color clarity',
  'Make maintenance and washing easier',
];

const CERAMIC_PACKAGES = {
  '1 Year Ceramic Coating': {
    subtitle: '1 Year ceramic coating',
    prices: { small: 300, medium: 350, large: 390 },
    items: CERAMIC_1YEAR_ITEMS,
  },
  '3 Year Ceramic Coating': {
    subtitle: '3 Year ceramic coating',
    prices: { small: 1000, medium: 1100, large: 1200 },
    items: CERAMIC_3YEAR_ITEMS,
  },
  '5 Year Ceramic Coating': {
    subtitle: '5 Year ceramic coating',
    prices: { small: 1100, medium: 1200, large: 1300 },
    items: CERAMIC_5YEAR_ITEMS,
  },
};

/** Paint Correction: custom content per package (API names: "1 Step paint correction", "2 Step paint correction") */
const PAINT_CORRECTION_1STEP_ITEMS = [
  'Pre-wash and 100% hand wash using spot-free water',
  'Cleaning of wheels, wheel well, tires and gas cap area',
  '2 Step Paint Correction (remove 40-60% of light swirls)',
  'With our 2 step paint correction service, you can get up to 80% of scratches and defects removed based on original condition.',
];

const PAINT_CORRECTION_2STEP_ITEMS = [
  'Pre-wash and 100% hand wash using spot-free water',
  'Cleaning of wheels, wheel well, tires and gas cap area',
  '2 Step Paint Correction (remove 80-90% of light swirls)',
  'With our 2 step paint correction service, you can get up to 80% of scratches and defects removed based on original condition. The process requires more time and energy than the 1 step enhancement polish, but benefits from a much higher level of scratch, defect and swirl removal.',
  'AVERAGE CAR, USED CAR, DAILY DRIVEN USE, NEGLECTED PAINT',
];

const PAINT_CORRECTION_PACKAGES = {
  '1 Step paint correction': {
    subtitle: '1 Step paint correction',
    prices: { small: 500, medium: 600, large: 700 },
    items: PAINT_CORRECTION_1STEP_ITEMS,
  },
  '2 Step paint correction': {
    subtitle: '2 Step paint correction',
    prices: { small: 1000, medium: 1200, large: 1300 },
    items: PAINT_CORRECTION_2STEP_ITEMS,
  },
};

/** Fleet Detailing: per-foot pricing, 2 cards (API names: "Wash & Spray Wax", "Wash & Hand Wax") */
const FLEET_PACKAGES = {
  'Wash & Spray Wax': {
    pricePerFoot: 15,
    items: [],
  },
  'Wash & Hand Wax': {
    pricePerFoot: 35,
    items: [],
  },
};

const VEHICLE_SIZES = [
  { key: 'small', label: 'Small Coupe/Sedans', priceKey: 'price_small', originalKey: 'price_original_small' },
  { key: 'medium', label: 'Medium SUV/Truck (4-5 Seater)', priceKey: 'price_medium', originalKey: 'price_original_medium' },
  { key: 'large', label: 'Large Minivan/Van (6-8 Seater)', priceKey: 'price_large', originalKey: 'price_original_large' },
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
    if (slug === 'fleet-detailing') return FLEET_PACKAGES;
    return null;
  };

  const isFleetDetailing = slug === 'fleet-detailing';
  const getPricePerFoot = (pkg) => {
    if (!isFleetDetailing || !pkg?.name) return null;
    const data = FLEET_PACKAGES[pkg.name.trim()];
    return data?.pricePerFoot ?? null;
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

                        {isFleetDetailing && getPricePerFoot(pkg) != null ? (
                          <p className="service-level-price-per-foot">${getPricePerFoot(pkg)} per foot</p>
                        ) : (
                          <div className="service-level-price-boxes">
                            {VEHICLE_SIZES.map((size) => {
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
                            })}
                          </div>
                        )}

                        {turnaround(pkg) && (
                          <p className="service-level-turnaround">TURNAROUND: {turnaround(pkg)}</p>
                        )}

                        {items.length > 0 && (
                          <ul className="service-level-list">
                            {items.map((line, i) => {
                              const isSectionHeading = /^(Interior|Exterior)\s+Items?:$/i.test(String(line).trim());
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
