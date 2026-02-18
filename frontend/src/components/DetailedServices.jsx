import React from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '../lib/images';
import './DetailedServices.css';

function DetailedServices() {
  return (
    <section className="detailed-services">
      <div className="detailed-services-grid">
        <div className="detailed-services-image">
          <div className="detailed-services-image-grid">
            <img src={PATHS.cars1} alt="Our detailing services" className="detailed-services-img" />
            <img src={PATHS.cars2} alt="Detailing services" className="detailed-services-img" />
            <img src={PATHS.interior5} alt="Interior detailing" className="detailed-services-img" />
            <img src={PATHS.interior6} alt="Interior care" className="detailed-services-img" />
            <img src={PATHS.ceramicCoating} alt="Ceramic coating" className="detailed-services-img" />
            <img src={PATHS.ceramicCoating2} alt="Ceramic protection" className="detailed-services-img" />
            <img src={PATHS.painting2} alt="Paint correction" className="detailed-services-img" />
            <img src={PATHS.fullDetailing2Webp} alt="Full detailing" className="detailed-services-img" />
            <img src={PATHS.maintenance2Webp} alt="Maintenance" className="detailed-services-img" />
          </div>
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
