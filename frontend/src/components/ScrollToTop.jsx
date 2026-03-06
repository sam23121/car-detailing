import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls the window to top whenever the route (pathname) changes.
 * Fixes: opening a service page at bottom, back button restoring mid-page scroll,
 * and "Book Now" links opening the book page scrolled down.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window.history.scrollRestoration === 'string') {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    // Scroll immediately
    window.scrollTo(0, 0);
    // Scroll again after the new route has painted (handles async content and layout shift)
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
    });
    const t2 = setTimeout(() => window.scrollTo(0, 0), 100);
    return () => {
      cancelAnimationFrame(t);
      clearTimeout(t2);
    };
  }, [pathname]);

  return null;
}

export default ScrollToTop;
