import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';
import { resolveServiceImage } from '../lib/images';
import { getServiceDisplayName } from '../lib/services';
import './ServiceCategories.css';

// Display order on home: full → exterior → interior → monthly maintenance → paint correction → ceramic → fleet
const SERVICE_SLUG_ORDER = [
  'full-detailing',
  'exterior-detailing',
  'interior-detailing',
  'monthly-maintenance',
  'paint-correction',
  'ceramic-coating',
  'fleet-detailing',
];

function sortServicesByOrder(services) {
  if (!Array.isArray(services) || services.length === 0) return services;
  const orderMap = Object.fromEntries(SERVICE_SLUG_ORDER.map((s, i) => [s, i]));
  return [...services].sort((a, b) => {
    const ai = orderMap[a.slug] ?? 999;
    const bi = orderMap[b.slug] ?? 999;
    return ai - bi;
  });
}

function ServiceCategories() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/services/`)
      .then((res) => setServices(sortServicesByOrder(res.data)))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="services" className="service-categories">
        <div className="service-categories-inner">
          <div className="service-category-card service-category-card-skeleton">Loading…</div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="service-categories">
      <div className="service-categories-inner">
        {services.map((service) => (
          <Link
            key={service.id}
            to={`/services/${service.slug}`}
            className="service-category-card"
          >
            <div className="service-category-card-image">
              <img
                src={resolveServiceImage(service)}
                alt={getServiceDisplayName(service)}
              />
            </div>
            <span className="service-category-card-name">{getServiceDisplayName(service)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default ServiceCategories;
