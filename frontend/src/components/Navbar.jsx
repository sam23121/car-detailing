import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { PATHS } from '../lib/images';
import './Navbar.css';

const SCROLL_THRESHOLD = 24;

function Navbar() {
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar navbar-dark${scrolled ? ' navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-img-wrap">
            <img src={PATHS.logo} alt="YMB Habesha" className="navbar-logo-img" />
          </span>
          <span className="navbar-logo-text">YMB Habesha</span>
        </Link>
        <ul className="nav-menu">
          <li><Link to="/">Home</Link></li>
          <li><a href="/#services">Services</a></li>
          {/* <li><a href="/#reviews">Reviews</a></li> */}
          {/* <li><a href="/#blog">Blog</a></li> */}
          <li><a href="/#faq">FAQ</a></li>
          <li><a href="/#contact">Contact</a></li>
          {count > 0 && (
            <li>
              <Link to="/booking" className="navbar-cart">
                Booking ({count})
              </Link>
            </li>
          )}
          <li><Link to="/book" className="schedule-btn">Book Now</Link></li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
