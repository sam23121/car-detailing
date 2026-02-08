import React from 'react';
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
  return (
    <main>
      <Hero />
      <FeaturedImage />
      <div className="featured-image-slide-over">
        <WelcomeSection />
        <ServiceCategories />
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
