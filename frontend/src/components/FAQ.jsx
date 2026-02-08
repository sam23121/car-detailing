import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
import './FAQ.css';

const DEFAULT_FAQS = [
  { id: '1', question: 'What is mobile auto detailing?', answer: 'We come to your home or office with all equipment and products to clean, correct, and protect your vehicle’s interior and exterior—no need to drive anywhere.' },
  { id: '2', question: 'What areas do you service?', answer: 'We serve Maryland and the Washington DC area. Contact us to confirm we cover your location.' },
  { id: '3', question: 'Do I need a water/electricity source?', answer: 'We bring our own water and power where possible. For some services we may need access to a hose or outlet—we’ll confirm when you book.' },
  { id: '4', question: 'What forms of payment do you accept?', answer: 'We accept major credit cards, debit cards, and other common payment methods. Details are provided at booking.' },
  { id: '5', question: 'What should I prepare?', answer: 'Clear personal items from the interior and ensure we have space to work around the vehicle. We’ll handle the rest.' },
  { id: '6', question: 'How long will it take?', answer: 'It depends on the service—from a quick wash to a full correction and coating. We’ll give you an estimate when you book.' },
];

function FAQ({ id }) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/api/business/faq`)
      .then((res) => setFaqs(res.data.length > 0 ? res.data : DEFAULT_FAQS))
      .catch(() => setFaqs(DEFAULT_FAQS))
      .finally(() => setLoading(false));
  }, []);

  const list = faqs.length > 0 ? faqs : DEFAULT_FAQS;

  return (
    <section id={id} className="faq faq-dark">
      <div className="faq-grid">
        <div className="faq-image">
          <div className="faq-image-placeholder" />
        </div>
        <div className="faq-content">
          <h2>Auto Detailing FAQs</h2>
          {loading ? (
            <p className="loading">Loading...</p>
          ) : (
            <div className="faq-accordion">
              {list.map((faq) => {
                const itemId = faq.id?.toString() ?? faq.question;
                const isOpen = openId === itemId;
                return (
                  <div
                    key={itemId}
                    className={`faq-accordion-item ${isOpen ? 'open' : ''}`}
                  >
                    <button
                      type="button"
                      className="faq-accordion-trigger"
                      onClick={() => setOpenId(isOpen ? null : itemId)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      <span className="faq-accordion-icon">{isOpen ? '−' : '+'}</span>
                    </button>
                    <div className="faq-accordion-body">
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
