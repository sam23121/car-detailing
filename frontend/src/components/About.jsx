import React from 'react';
import { PATHS } from '../lib/images';
import SectionCTAs from './SectionCTAs';
import './About.css';

function About() {
  return (
    <section id="about" className="about">
      <div className="about-grid">
        <div className="about-content">
          <h2>About YMB Habesha – How It Started</h2>
          <p className="section-subtext">
            YMB Habesha was built on a simple idea: bring professional-grade auto detailing 
            to our customers wherever they are. Serving Maryland, Virginia and the DC area, we focus on interior and 
            exterior care, paint correction, and ceramic coating so your vehicle looks and stays like new.
          </p>
          <div className="about-buttons">
            <SectionCTAs />
          </div>
        </div>
        <div className="about-image">
          <img src={PATHS.beforeAfter} alt="Before and after detailing" className="about-image-img" />
        </div>
      </div>
    </section>
  );
}

export default About;
