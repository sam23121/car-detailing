import React from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '../lib/images';
import './Hero.css';

const HERO_DESCRIPTION =
  'We deliver reliable, efficient detailing for personal cars and fleets—restoring showroom shine, extending vehicle life, and protecting your investment.';

const HERO_CARDS = [
  { image: PATHS.fullDetailing, title: 'Full Detailing', text: 'Interior & exterior packages for every need.', to: '/services/full-detailing' },
  { image: PATHS.interior1, title: 'Interior Care', text: 'Deep cleans, conditioning, and protection.', to: '/services/interior-detailing' },
  { image: PATHS.ceramicCoating, title: 'Ceramic & Paint', text: 'Correction, coating, and long-term shine.', to: '/services/ceramic-coating' },
];

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
        <div className="hero-cards">
          {HERO_CARDS.map((card) => (
            <Link key={card.title} to={card.to} className="hero-card">
              <div className="hero-card-image">
                <img src={card.image} alt={card.title} />
              </div>
              <h3 className="hero-card-title">{card.title}</h3>
              <p className="hero-card-text">{card.text}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;
