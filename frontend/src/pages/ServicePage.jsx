import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import './ServicePage.css';

function ServicePage() {
  const { slug } = useParams();
  const { items: cartItems, addItem } = useCart();
  const { showToast } = useToast();
  const [service, setService] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const serviceRes = await axios.get(`${API_BASE}/api/services/slug/${slug}`);
        setService(serviceRes.data);
        const pkgRes = await axios.get(`${API_BASE}/api/services/${serviceRes.data.id}/packages`);
        setPackages(pkgRes.data);
      } catch (err) {
        setError('Service not found');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetch();
  }, [slug]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error || !service) {
    return (
      <main className="service-page">
        <div className="service-container">
          <p>{error || 'Service not found'}</p>
          <Link to="/">Back to Home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="service-page">
      <div className="service-container">
        <Link to="/book" className="back-link back-link-top">← Back to services</Link>
        <h1>{service.name}</h1>
        {service.description && (
          <div className="service-detail-block">
            <h2 className="service-detail-heading">About this service</h2>
            <p className="service-desc">{service.description}</p>
          </div>
        )}
        <div className="packages-section">
          <h2>Packages & pricing</h2>
          {packages.length > 0 ? (
            <div className="packages-grid">
              {packages.map((pkg) => (
                <div key={pkg.id} className="package-card">
                  <h3>{pkg.name}</h3>
                  {pkg.description && <p>{pkg.description}</p>}
                  {pkg.price != null && <p className="price">${Number(pkg.price).toFixed(2)}</p>}
                  {pkg.duration_minutes && <p className="duration">{pkg.duration_minutes} min</p>}
                  {pkg.details && <p className="details">{pkg.details}</p>}
                  <div className="package-card-actions">
                    <button
                      type="button"
                      className={`btn ${cartItems.some((i) => i.id === pkg.id) ? 'btn-added' : 'btn-primary'}`}
                      onClick={() => {
                        if (cartItems.some((i) => i.id === pkg.id)) {
                          showToast('Already in your booking');
                          return;
                        }
                        addItem({ id: pkg.id, name: pkg.name, price: pkg.price, service_name: service.name });
                        showToast('Added to booking');
                      }}
                    >
                      {cartItems.some((i) => i.id === pkg.id) ? 'In booking' : 'Add to booking'}
                    </button>
                    <Link to="/booking" className="btn btn-secondary">Go to checkout</Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No packages for this service yet. <Link to="/booking">Request a quote</Link>.</p>
          )}
        </div>
        <Link to="/book" className="back-link">← Back to services</Link>
      </div>
    </main>
  );
}

export default ServicePage;
