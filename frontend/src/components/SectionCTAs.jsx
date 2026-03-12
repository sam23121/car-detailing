import React from 'react';
import { Link } from 'react-router-dom';
import { BUSINESS } from '../config';
import './SectionCTAs.css';

const smsHref = `sms:${BUSINESS.phone.replace(/\D/g, '').replace(/^(\d{10})$/, '+1$1')}`;

/**
 * @param {Object} props
 * @param {string} [props.wrapperClassName]
 * @param {{ label: string, href: string }} [props.third] - Optional third button (e.g. View Services, Contact Us). Renders as gray/secondary.
 */
function SectionCTAs({ wrapperClassName = '', third }) {
  return (
    <div className={`section-cta-group ${wrapperClassName}`.trim()}>
      <Link to="/book" className="btn btn-primary section-cta">Book Now</Link>
      <a href={smsHref} className="btn btn-primary section-cta">Text Us</a>
      {third && (
        <a href={third.href} className="btn btn-secondary section-cta">{third.label}</a>
      )}
    </div>
  );
}

export default SectionCTAs;
