import React from 'react';
import { PATHS } from '../lib/images';
import SectionCTAs from './SectionCTAs';
import './ServicesOverview.css';

const OVERVIEW_IMAGES = [PATHS.newFullDetailing, PATHS.interior3, PATHS.engineBay, PATHS.newPaintCorrection1];

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
            We bring professional interior and exterior detailing to your home or office across Maryland, Virginia and DC. 
            From full corrections to quick maintenance washes, our mobile service keeps your vehicle looking its best.
          </p>
          <div className="services-overview-buttons">
            <SectionCTAs third={{ label: 'Our Process', href: '/#process' }} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServicesOverview;
