import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';
import './BookServiceSelectPage.css';

const SERVICE_IMAGES = {
  'ceramic-coating': '🛡️',
  'full-detailing': '✨',
  'interior-detailing': '🧼',
  'exterior-detailing': '🚗',
  'fleet-detailing': '🚐',
  'maintenance-detailing': '🔧',
};

function BookServiceSelectPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/services/`)
      .then((res) => setServices(res.data))
      .catch(() => setError('Could not load services'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="book-select loading">Loading services...</div>;
  if (error) return <div className="book-select error">{error}</div>;

  return (
    <main className="book-select">
      <div className="book-select-header">
        <h1>Choose a Service</h1>
        <p>Select a service below to see details and book</p>
      </div>
      <div className="book-select-grid">
        {services.map((service) => (
          <Link
            key={service.id}
            to={`/services/${service.slug}`}
            className="book-service-card"
          >
            <div className="book-service-card-image">
              {service.image_url ? (
                <img src={service.image_url} alt={service.name} />
              ) : (
                <span className="book-service-card-icon">
                  {SERVICE_IMAGES[service.slug] || '✨'}
                </span>
              )}
            </div>
            <h2 className="book-service-card-title">{service.name}</h2>
            <span className="book-service-card-cta">View details & book →</span>
          </Link>
        ))}
      </div>
    </main>
  );
}

export default BookServiceSelectPage;
