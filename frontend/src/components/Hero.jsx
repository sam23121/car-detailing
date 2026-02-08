import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const HERO_DESCRIPTION =
  'We deliver reliable, efficient detailing for personal cars and fleets by our certified professionals—restoring showroom shine, extending vehicle life, and protecting your investment.';

function Hero() {
  return (
    <section className="hero hero-dark">
      <div className="hero-bg" />
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-grid">
          <div className="hero-left">
            <p className="hero-label">MOBILE DETAILING SERVICE</p>
            <h1>
              <span className="hero-title-main">The Ultimate Car</span>
              <span className="hero-title-accent"> Detailing Service</span>
            </h1>
          </div>
          <div className="hero-right">
            <p className="hero-description">{HERO_DESCRIPTION}</p>
            <Link to="/book" className="btn btn-primary hero-cta">Book Now</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
