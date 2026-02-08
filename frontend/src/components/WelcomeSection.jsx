import React from 'react';
import './WelcomeSection.css';

function WelcomeSection() {
  return (
    <section className="welcome-section">
      <div className="welcome-section-inner">
        <h2 className="welcome-title">Welcome to YMB Habesha AutoDetail</h2>
        <p className="welcome-subtitle">Premium Car Detailing</p>
        <p className="welcome-text">
          From deep interior cleaning to long-lasting ceramic coating, we restore and protect
          your vehicle with precision, care, and a commitment to perfection.
        </p>
      </div>
    </section>
  );
}

export default WelcomeSection;
