import React from 'react';
import './Reviews.css';

function Reviews({ reviews, id }) {
  return (
    <section id={id} className="reviews">
      <div className="reviews-container">
        <h2>Customer Reviews</h2>
        <p>5-Star Rating on Google with OVER 250 Reviews</p>
        <div className="reviews-grid">
          {reviews && reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-rating">
                  {'⭐'.repeat(review.rating)}
                </div>
                <p className="review-comment">{review.comment}</p>
                <p className="review-author">- Customer</p>
              </div>
            ))
          ) : (
            <p className="no-reviews">No reviews yet. Be the first to leave one!</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default Reviews;
