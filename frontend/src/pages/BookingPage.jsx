import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';
import './BookingPage.css';

function BookingPage() {
  const [searchParams] = useSearchParams();
  const preselectedPackageId = searchParams.get('package');

  const [packages, setPackages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    package_id: preselectedPackageId ? parseInt(preselectedPackageId, 10) : '',
    scheduled_date: '',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPackages = async () => {
      try {
        const servicesRes = await axios.get(`${API_BASE}/api/services/`);
        const allPackages = [];
        for (const svc of servicesRes.data) {
          const pkgRes = await axios.get(`${API_BASE}/api/services/${svc.id}/packages`);
          allPackages.push(...pkgRes.data.map((p) => ({ ...p, service_name: svc.name })));
        }
        setPackages(allPackages);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadPackages();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'package_id' ? (value ? parseInt(value, 10) : '') : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!formData.package_id || !formData.scheduled_date || !formData.name || !formData.email) {
      setError('Please fill in name, email, package, and date.');
      return;
    }
    try {
      const customerRes = await axios.post(`${API_BASE}/api/customers/`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null
      });
      const customerId = customerRes.data.id;
      await axios.post(`${API_BASE}/api/bookings/`, {
        customer_id: customerId,
        package_id: formData.package_id,
        scheduled_date: new Date(formData.scheduled_date).toISOString(),
        notes: formData.notes || null
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', package_id: '', scheduled_date: '', notes: '' });
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map((d) => d.msg || JSON.stringify(d)).join(' ')
        : typeof detail === 'string'
          ? detail
          : 'Failed to create booking. Please try again.';
      setError(message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <main className="booking-page">
      <div className="booking-container">
        <h1>Schedule Your Detailing</h1>
        {submitted && <p className="success-message">Booking request submitted! We'll confirm soon.</p>}
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="booking-form">
          <label>Name *</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          <label>Email *</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          <label>Phone</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
          <label>Package *</label>
          <select name="package_id" value={formData.package_id} onChange={handleChange} required>
            <option value="">Select a package</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.service_name} – {pkg.name}
                {pkg.price != null ? ` ($${Number(pkg.price).toFixed(2)})` : ''}
              </option>
            ))}
          </select>
          <label>Preferred Date & Time *</label>
          <input
            type="datetime-local"
            name="scheduled_date"
            value={formData.scheduled_date}
            onChange={handleChange}
            required
          />
          <label>Notes</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" />
          <button type="submit" className="btn btn-primary">Submit Booking Request</button>
        </form>
      </div>
    </main>
  );
}

export default BookingPage;
