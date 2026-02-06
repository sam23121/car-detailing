import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

function Hero() {
  return (
    <section className="hero hero-dark">
      <div className="hero-bg" />
      <div className="hero-overlay" />
      <div className="hero-content">
        <h1>Professional Interior & Exterior Mobile Detailing Services in Maryland</h1>
        <div className="hero-buttons">
          <Link to="/booking" className="btn btn-primary">Book Now</Link>
          <a href="/#services" className="btn btn-secondary">Learn More</a>
        </div>
        <p className="hero-tagline">Book your next mobile detail service.</p>
      </div>
    </section>
  );
}

export default Hero;
