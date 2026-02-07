import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';
import './ServicePage.css';

function ServicePage() {
  const { slug } = useParams();
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
        <h1>{service.name}</h1>
        {service.description && <p className="service-desc">{service.description}</p>}
        <div className="packages-section">
          <h2>Packages</h2>
          {packages.length > 0 ? (
            <div className="packages-grid">
              {packages.map((pkg) => (
                <div key={pkg.id} className="package-card">
                  <h3>{pkg.name}</h3>
                  {pkg.description && <p>{pkg.description}</p>}
                  {pkg.price != null && <p className="price">${Number(pkg.price).toFixed(2)}</p>}
                  {pkg.duration_minutes && <p className="duration">{pkg.duration_minutes} min</p>}
                  {pkg.details && <p className="details">{pkg.details}</p>}
                  <Link to={`/booking?package=${pkg.id}`} className="btn btn-primary">Book This Package</Link>
                </div>
              ))}
            </div>
          ) : (
            <p>No packages for this service yet. <Link to="/booking">Request a quote</Link>.</p>
          )}
        </div>
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>
    </main>
  );
}

export default ServicePage;
