import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import FeaturedImage from '../components/FeaturedImage';
import WelcomeSection from '../components/WelcomeSection';
import ServicesOverview from '../components/ServicesOverview';
import Process from '../components/Process';
import ServiceCategories from '../components/ServiceCategories';
import DetailedServices from '../components/DetailedServices';
import About from '../components/About';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';

function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace(/^#/, '');
    const el = document.getElementById(id);
    if (el) {
      const scroll = () => el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const t = setTimeout(scroll, 100);
      return () => clearTimeout(t);
    }
  }, [hash]);

  return (
    <main className="main-home">
      <section className="hero-extended">
        <Hero />
        <FeaturedImage />
      </section>
      <div className="featured-image-slide-over">
        <section className="welcome-and-services-section">
          <WelcomeSection />
          <ServiceCategories />
        </section>
        <ServicesOverview />
        <Process />
        <DetailedServices />
        <About />
        <FAQ id="faq" />
        <Contact id="contact" />
      </div>
      {/* Footer is rendered by App.jsx layout */}
    </main>
  );
}

export default Home;
