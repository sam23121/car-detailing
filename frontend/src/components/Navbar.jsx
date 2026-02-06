import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar navbar-dark">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">QMD</span>
          <span className="navbar-logo-text">Quality Mobile Detailing</span>
        </Link>
        <ul className="nav-menu">
          <li><Link to="/">Home</Link></li>
          <li><a href="/#services">Services</a></li>
          {/* <li><a href="/#reviews">Reviews</a></li> */}
          <li><a href="/#blog">Blog</a></li>
          <li><a href="/#faq">FAQ</a></li>
          <li><a href="/#contact">Contact</a></li>
          <li><Link to="/booking" className="schedule-btn">Book Now</Link></li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
