import React, { useState } from 'react';
import axios from 'axios';
import './Contact.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function Contact({ id }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await axios.post(`${API_BASE}/api/contact/`, formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to send message. Please try again or call us.');
    }
  };

  return (
    <section id={id} className="contact">
      <div className="contact-container">
        <h2>Get in Touch</h2>
        <div className="contact-content">
          <div className="contact-info">
            <h3>Contact Information</h3>
            <p><strong>Phone:</strong> <a href="tel:(410)575-4616">(410) 575-4616</a></p>
            <p><strong>Email:</strong> <a href="mailto:KevinQualityMobileDetailing@gmail.com">KevinQualityMobileDetailing@gmail.com</a></p>
            <p><strong>Address:</strong> 911 Autumn Valley Ln, Gambrills, MD 21054</p>
            <p><strong>Hours:</strong> Monday - Sunday: 6:00 AM - 8:00 PM</p>
          </div>
          <form onSubmit={handleSubmit} className="contact-form">
            {submitted && <p className="success-message">Thank you! We'll be in touch soon.</p>}
            {error && <p className="error-message">{error}</p>}
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Your Phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <textarea
              name="message"
              placeholder="Your Message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
            <button type="submit" className="btn btn-primary">Send Message</button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
