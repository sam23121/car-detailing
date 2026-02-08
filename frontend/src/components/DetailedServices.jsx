import React from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '../lib/images';
import './DetailedServices.css';

function DetailedServices() {
  return (
    <section className="detailed-services">
      <div className="detailed-services-grid">
        <div className="detailed-services-image">
          <img src={PATHS.cars1} alt="Our detailing services" className="detailed-services-img" />
        </div>
        <div className="detailed-services-panel">
          <h2>Our Services</h2>
          <p className="section-subtext">
            From interior deep cleans to paint correction and ceramic coating, we offer a full range of mobile detailing 
            services to suit your vehicle and budget. All work is done at your location with professional equipment and products.
          </p>
          <Link to="/book" className="btn btn-primary">Book a Service</Link>
        </div>
      </div>
    </section>
  );
}

export default DetailedServices;
