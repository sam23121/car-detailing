import React from 'react';
import { Link } from 'react-router-dom';
import { BUSINESS } from '../config';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>YMB Habesha</h4>
          <p>Professional auto detailing services in DC, Maryland, and Virginia</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/#services">Services</Link></li>
            <li><Link to="/#faq">FAQ</Link></li>
            <li><Link to="/#contact">Contact</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Phone: <a href={`tel:${BUSINESS.phone.replace(/\D/g, '')}`}>{BUSINESS.phone}</a></p>
          <p>Email: <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a></p>
        </div>
        <div className="footer-section">
          <h4>Owner</h4>
          <p><a href="/admin">Admin (bookings & availability)</a></p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 YMB Habesha. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
