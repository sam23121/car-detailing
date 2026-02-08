import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';
import { resolveServiceImage } from '../lib/images';
import './ServiceCategories.css';

function ServiceCategories() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/services/`)
      .then((res) => setServices(res.data))
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
                alt={service.name}
              />
            </div>
            <span className="service-category-card-name">{service.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default ServiceCategories;
