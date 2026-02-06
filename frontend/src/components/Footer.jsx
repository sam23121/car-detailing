import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>Quality Mobile Detailing</h4>
          <p>Professional auto detailing services in Maryland and DC</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/#services">Services</a></li>
            <li><a href="/#reviews">Reviews</a></li>
            <li><a href="/#contact">Contact</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Phone: <a href="tel:(410)575-4616">(410) 575-4616</a></p>
          <p>Email: <a href="mailto:KevinQualityMobileDetailing@gmail.com">Kevin...</a></p>
        </div>
        <div className="footer-section">
          <h4>Owner</h4>
          <p><a href="/admin/bookings">View & confirm bookings</a></p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Quality Mobile Detailing. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
