import React from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '../lib/images';
import './ServicesOverview.css';

const OVERVIEW_IMAGES = [PATHS.fullDetailing, PATHS.interior1, PATHS.exterior1, PATHS.ceramicCoating];

function ServicesOverview() {
  return (
    <section className="services-overview">
      <div className="services-overview-grid">
        <div className="services-overview-images">
          <div className="services-image-grid">
            {OVERVIEW_IMAGES.map((src, i) => (
              <div key={i} className="services-img-wrap">
                <img src={src} alt="" className="services-img" />
              </div>
            ))}
          </div>
        </div>
        <div className="services-overview-panel">
          <h2>YMB Habesha – Full Detailing and Daily Driver Care</h2>
          <p className="section-subtext">
            We bring professional interior and exterior detailing to your home or office across Maryland and DC. 
            From full corrections to quick maintenance washes, our mobile service keeps your vehicle looking its best.
          </p>
          <div className="services-overview-buttons">
            <Link to="/book" className="btn btn-primary">Book Now</Link>
            <a href="/#process" className="btn btn-secondary">Our Process</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServicesOverview;
