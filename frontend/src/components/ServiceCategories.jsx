import React from 'react';
import { Link } from 'react-router-dom';
import './ServiceCategories.css';

const CATEGORIES = [
  { name: 'Interior Detailing', slug: 'interior-detailing' },
  { name: 'Paint Correction', slug: 'exterior-detailing' },
  { name: 'Exterior Detailing', slug: 'exterior-detailing' },
  { name: 'Ceramic Coating', slug: 'ceramic-coating' },
];

function ServiceCategories() {
  return (
    <section id="services" className="service-categories">
      <div className="service-categories-inner">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug + cat.name}
            to={`/services/${cat.slug}`}
            className="service-category-card"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

export default ServiceCategories;
