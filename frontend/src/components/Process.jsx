import React from 'react';
import { Link } from 'react-router-dom';
import './Process.css';

function Process() {
  const steps = [
    { num: '1', title: 'Book online or call', text: 'Choose your service and pick a time that works for you. We come to you.' },
    { num: '2', title: 'We arrive at your location', text: 'Our team brings everything needed for a full detail at your home or office.' },
    { num: '3', title: 'Enjoy a like-new vehicle', text: 'Relax while we clean, correct, and protect your car inside and out.' },
  ];

  return (
    <section id="process" className="process">
      <div className="process-grid">
        <div className="process-content">
          <h2>Our Mobile Detailing Process in 3 Easy Steps</h2>
          <p className="section-subtext">
            Getting a professional detail has never been easier. We handle the rest so you can get back to your day.
          </p>
          <ul className="process-steps">
            {steps.map((step) => (
              <li key={step.num}>
                <span className="process-num">{step.num}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="process-buttons">
            <Link to="/book" className="btn btn-primary">Book Now</Link>
            <a href="/#services" className="btn btn-secondary">View Services</a>
          </div>
        </div>
        <div className="process-image">
          <div className="process-image-placeholder" />
        </div>
      </div>
    </section>
  );
}

export default Process;
