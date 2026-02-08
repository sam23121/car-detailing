import React from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '../lib/images';
import './About.css';

function About() {
  return (
    <section id="about" className="about">
      <div className="about-grid">
        <div className="about-content">
          <h2>About YMB Habesha – How It Started</h2>
          <p className="section-subtext">
            YMB Habesha was built on a simple idea: bring professional-grade auto detailing 
            to our customers wherever they are. Serving Maryland and the DC area, we focus on interior and 
            exterior care, paint correction, and ceramic coating so your vehicle looks and stays like new.
          </p>
          <div className="about-buttons">
            <Link to="/book" className="btn btn-primary">Book Now</Link>
            <a href="/#contact" className="btn btn-secondary">Contact Us</a>
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
