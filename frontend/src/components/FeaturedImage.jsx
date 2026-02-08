import React from 'react';
import { PATHS } from '../lib/images';
import './FeaturedImage.css';

function FeaturedImage() {
  return (
    <section className="featured-image-section" aria-hidden>
      <div className="featured-image-wrap">
        <img src={PATHS.heroLambergini} alt="" className="featured-image-img" />
        <div className="featured-image-dim" />
      </div>
    </section>
  );
}

export default FeaturedImage;
