import React from 'react';
import Hero from '../components/Hero';
import ServicesOverview from '../components/ServicesOverview';
import Process from '../components/Process';
import ServiceCategories from '../components/ServiceCategories';
import DetailedServices from '../components/DetailedServices';
import About from '../components/About';
// import Reviews from '../components/Reviews';  // Commented out – see CUSTOMIZATIONS.md
// import Blog from '../components/Blog';  // Commented out – see CUSTOMIZATIONS.md
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';

function Home() {
  return (
    <main>
      <Hero />
      <ServicesOverview />
      <Process />
      <ServiceCategories />
      <DetailedServices />
      <About />
      {/* Reviews section commented out – see CUSTOMIZATIONS.md to restore
      <Reviews reviews={reviews} id="reviews" />
      */}
      {/* Blog section commented out – see CUSTOMIZATIONS.md to restore
      <Blog id="blog" />
      */}
      <FAQ id="faq" />
      <Contact id="contact" />
    </main>
  );
}

export default Home;
