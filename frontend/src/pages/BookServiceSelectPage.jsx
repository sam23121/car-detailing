import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';
import { resolveServiceImage } from '../lib/images';
import { getServiceDisplayName, filterVisibleServices } from '../lib/services';
import './BookServiceSelectPage.css';

function BookServiceSelectPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/services/`)
      .then((res) => setServices(filterVisibleServices(res.data)))
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
              <img
                src={resolveServiceImage(service)}
                alt={getServiceDisplayName(service)}
              />
            </div>
            <h2 className="book-service-card-title">{getServiceDisplayName(service)}</h2>
            <span className="book-service-card-cta">View details & book →</span>
          </Link>
        ))}
      </div>
    </main>
  );
}

export default BookServiceSelectPage;
