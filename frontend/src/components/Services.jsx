import React from 'react';
import { Link } from 'react-router-dom';
import './Services.css';

const SERVICE_CARDS = [
  { name: 'Ceramic Coating', slug: 'ceramic-coating', icon: '🛡️' },
  { name: 'In & Out Detailing', slug: 'full-detailing', icon: '✨' },
  { name: 'Interior Detailing', slug: 'interior-detailing', icon: '🧼' },
  { name: 'Exterior Detailing', slug: 'exterior-detailing', icon: '🚗' },
  { name: 'Fleet Detailing', slug: 'fleet-detailing', icon: '🚐' },
  { name: 'Maintenance Detailing', slug: 'maintenance-detailing', icon: '🔧' },
];

function Services({ services, id }) {
  return (
    <section id={id} className="services">
      <div className="services-container">
        <h2>Our Services</h2>
        <p>Choose the detailing service that's right for you</p>
        <div className="services-grid">
          {SERVICE_CARDS.map((service) => (
            <Link key={service.slug} to={`/services/${service.slug}`} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.name}</h3>
              <p>Learn more →</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
