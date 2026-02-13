import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { PATHS } from '../lib/images';
import './Navbar.css';

const SCROLL_THRESHOLD = 24;

function Navbar() {
  const { count } = useCart();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    window.addEventListener('scroll', onScroll, { passive: true });
    const t = setTimeout(onScroll, 200);
    return () => {
      clearTimeout(t);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const showSolidNav = scrolled || !isHome;

  return (
    <nav className={`navbar navbar-dark${showSolidNav ? ' navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-img-wrap">
            <img src={PATHS.logo} alt="YMB Habesha" className="navbar-logo-img" />
          </span>
          <span className="navbar-logo-text">YMB Habesha</span>
        </Link>
        <ul className="nav-menu">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/#services">Services</Link></li>
          {/* <li><Link to="/#reviews">Reviews</Link></li> */}
          {/* <li><Link to="/#blog">Blog</Link></li> */}
          <li><Link to="/#faq">FAQ</Link></li>
          <li><Link to="/#contact">Contact</Link></li>
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
