import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';
import { BUSINESS } from '../config';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { resolvePackageImage } from '../lib/images';
import './PackageDetailPage.css';

const VEHICLE_SIZES = [
  { key: 'small', label: 'Small Coupe/Sedans', priceKey: 'price_small', originalKey: 'price_original_small' },
  { key: 'medium', label: 'Medium SUV/Truck (4-5 Seater)', priceKey: 'price_medium', originalKey: 'price_original_medium' },
  { key: 'large', label: 'Large Minivan/Van (6-8 Seater)', priceKey: 'price_large', originalKey: 'price_original_large' },
];

function PackageDetailPage() {
  const { slug, packageId } = useParams();
  const { addItem, items: cartItems } = useCart();
  const { showToast } = useToast();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('small'); // for tiered pricing

  const hasTieredPricing = pkg && (pkg.price_small != null || pkg.price_medium != null || pkg.price_large != null);

  useEffect(() => {
    if (!packageId) return;
    axios
      .get(`${API_BASE}/api/packages/${packageId}`)
      .then((res) => setPkg(res.data))
      .catch(() => setError('Package not found'))
      .finally(() => setLoading(false));
  }, [packageId]);

  const displayPrice = () => {
    if (!pkg) return null;
    if (hasTieredPricing) {
      const priceKey = selectedSize === 'small' ? 'price_small' : selectedSize === 'medium' ? 'price_medium' : 'price_large';
      const originalKey = selectedSize === 'small' ? 'price_original_small' : selectedSize === 'medium' ? 'price_original_medium' : 'price_original_large';
      const price = pkg[priceKey] ?? pkg.price;
      const original = pkg[originalKey];
      return { price, original };
    }
    return { price: pkg.price, original: null };
  };

  const turnaround = () => {
    if (!pkg) return null;
    if (pkg.turnaround_hours != null) return `${pkg.turnaround_hours} HOUR${pkg.turnaround_hours !== 1 ? 'S' : ''}`;
    if (pkg.duration_minutes) return `${Math.round(pkg.duration_minutes / 60)} HOUR${Math.round(pkg.duration_minutes / 60) !== 1 ? 'S' : ''}`;
    return null;
  };

  const handleScheduleNow = () => {
    if (!pkg) return;
    const { price } = displayPrice();
    if (price == null) {
      showToast('Please select an option');
      return;
    }
    if (cartItems.some((i) => i.id === pkg.id && (hasTieredPricing ? i.vehicleSize === selectedSize : true))) {
      showToast('Already in your booking');
      return;
    }
    const name = hasTieredPricing ? `${pkg.name} (${VEHICLE_SIZES.find((s) => s.key === selectedSize)?.label})` : pkg.name;
    addItem({
      id: pkg.id,
      name,
      price,
      service_name: pkg.service_name || '',
      ...(hasTieredPricing ? { vehicleSize: selectedSize } : {}),
    });
    showToast('Added to booking. We accept payment in person.');
  };

  if (loading) return <div className="package-detail-page loading">Loading...</div>;
  if (error || !pkg) {
    return (
      <main className="package-detail-page">
        <div className="package-detail-container">
          <p>{error || 'Package not found'}</p>
          <Link to="/book">← Back to services</Link>
        </div>
      </main>
    );
  }

  const priceInfo = displayPrice();
  const inCart = cartItems.some((i) => i.id === pkg.id && (hasTieredPricing ? i.vehicleSize === selectedSize : true));

  return (
    <main className="package-detail-page">
      <div className="package-detail-container">
        <Link to={`/services/${pkg.service_slug || slug}`} className="package-detail-back">← Back to {pkg.service_name}</Link>

        <div className="package-detail-layout">
          <div className="package-detail-image-wrap">
            <img src={resolvePackageImage(pkg, { slug: pkg.service_slug })} alt={pkg.name} />
            <div className="package-detail-reviews-card">
              <span className="package-detail-reviews-g">G</span>
              <div className="package-detail-stars">★★★★★</div>
              <span className="package-detail-reviews-count">322 reviews</span>
            </div>
          </div>

          <div className="package-detail-content">
            <h1 className="package-detail-title">{pkg.name.toUpperCase()} PACKAGE</h1>

            {hasTieredPricing ? (
              <div className="package-detail-tier-cards">
                {VEHICLE_SIZES.map((size) => {
                  const price = pkg[size.priceKey] ?? pkg.price;
                  if (price == null) return null;
                  return (
                    <button
                      type="button"
                      key={size.key}
                      className={`package-detail-tier-card ${selectedSize === size.key ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size.key)}
                    >
                      <div className="package-detail-tier-label">
                        {size.label} – ${Number(price).toFixed(0)}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              priceInfo?.price != null && (
                <div className="package-detail-single-price">
                  <span className="package-detail-tier-price">${Number(priceInfo.price).toFixed(0)}</span>
                </div>
              )
            )}

            {turnaround() && (
              <p className="package-detail-turnaround">TURNAROUND: {turnaround()}</p>
            )}

            {pkg.description && (
              <p className="package-detail-desc">{pkg.description}</p>
            )}
            {pkg.details && (
              <p className="package-detail-desc package-detail-desc-secondary">{pkg.details}</p>
            )}

            <div className="package-detail-actions">
              <a href={`sms:${BUSINESS.phone.replace(/\D/g, '').replace(/^(\d{10})$/, '+1$1')}`} className="btn package-detail-btn-call">
                TEXT NOW
              </a>
              <button
                type="button"
                className="btn package-detail-btn-schedule"
                onClick={handleScheduleNow}
                disabled={inCart}
              >
                {inCart ? 'IN BOOKING' : 'SCHEDULE NOW'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default PackageDetailPage;
