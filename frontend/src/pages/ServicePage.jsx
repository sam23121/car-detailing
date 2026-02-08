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
        // Do not show "Complete" package or similar legacy packages
        const list = (pkgRes.data || []).filter(
          (p) => p?.name && !p.name.toLowerCase().includes('complete')
        );
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

  const getPriceForPkg = (pkg, sizeKey) => {
    if (!pkg) return null;
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
    const parts = [];
    if (pkg.description) parts.push(pkg.description);
    if (pkg.details) {
      const lines = pkg.details.split(/\n/).map((s) => s.trim()).filter(Boolean);
      parts.push(...lines);
    }
    return parts.length ? parts : [];
  };

  const handleScheduleNow = (pkg) => {
    const sizeKey = selectedSizeByPkg[pkg.id] ?? 'small';
    const tiered = hasTieredPricing(pkg);
    const price = tiered ? getPriceForPkg(pkg, sizeKey) : pkg.price;
    if (price == null) {
      showToast('Please select vehicle size');
      return;
    }
    if (cartItems.some((i) => i.id === pkg.id && (tiered ? i.vehicleSize === sizeKey : true))) {
      showToast('Already in your booking');
      return;
    }
    const fullSizeLabel = tiered && VEHICLE_SIZES.find((s) => s.key === sizeKey);
    const name = tiered && fullSizeLabel
      ? `${pkg.name} (${fullSizeLabel.label})`
      : pkg.name;
    addItem({
      id: pkg.id,
      name,
      price,
      service_name: service?.name || '',
      ...(tiered ? { vehicleSize: sizeKey } : {}),
    });
    showToast('Added to booking');
  };

  const inCart = (pkg) => {
    const sizeKey = selectedSizeByPkg[pkg.id] ?? 'small';
    const tiered = hasTieredPricing(pkg);
    return cartItems.some((i) => i.id === pkg.id && (tiered ? i.vehicleSize === sizeKey : true));
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
                const tiered = hasTieredPricing(pkg);
                const sizeKey = selectedSizeByPkg[pkg.id] ?? 'small';
                const price = tiered ? getPriceForPkg(pkg, sizeKey) : pkg.price;
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
                        <h3 className="service-level-title">{pkg.name.toUpperCase()} PACKAGE</h3>

                        {tiered ? (
                          <div className="service-level-price-boxes">
                            {VEHICLE_SIZES.map((size) => {
                              const p = pkg[size.priceKey] ?? pkg.price;
                              const orig = pkg[size.originalKey];
                              if (p == null) return null;
                              return (
                                <button
                                  type="button"
                                  key={size.key}
                                  className={`service-level-price-box ${sizeKey === size.key ? 'selected' : ''}`}
                                  onClick={() => setSizeForPkg(pkg.id, size.key)}
                                >
                                  <span className="service-level-price-label">{size.label}</span>
                                  <span className="service-level-price-row">
                                    <span className="service-level-price-start">STARTING AT:</span>
                                    {orig != null && (
                                      <span className="service-level-price-original">${Number(orig).toFixed(0)}</span>
                                    )}
                                    <span className="service-level-price-current">${Number(p).toFixed(0)}</span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          price != null && (
                            <div className="service-level-single-price-block">
                              <span className="service-level-price-start">STARTING AT:</span>
                              <span className="service-level-price-current">${Number(price).toFixed(0)}</span>
                            </div>
                          )
                        )}

                        {turnaround(pkg) && (
                          <p className="service-level-turnaround">TURNAROUND: {turnaround(pkg)}</p>
                        )}

                        {items.length > 0 && (
                          <ul className="service-level-list">
                            {items.map((line, i) => (
                              <li key={i}>{line}</li>
                            ))}
                          </ul>
                        )}

                        <div className="service-level-actions">
                          <a href={`tel:${BUSINESS.phone}`} className="btn service-level-btn-call">
                            CALL NOW
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
