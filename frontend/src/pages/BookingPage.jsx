import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import './BookingPage.css';

function BookingPage() {
  const [searchParams] = useSearchParams();
  const preselectedPackageId = searchParams.get('package');
  const { items: cartItems, addItem, removeItem, clearCart } = useCart();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!preselectedPackageId || cartItems.length > 0) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const servicesRes = await axios.get(`${API_BASE}/api/services/`);
        for (const svc of servicesRes.data) {
          const pkgRes = await axios.get(`${API_BASE}/api/services/${svc.id}/packages`);
          const pkg = pkgRes.data.find((p) => p.id === parseInt(preselectedPackageId, 10));
          if (pkg && !cancelled) {
            addItem({ id: pkg.id, name: pkg.name, price: pkg.price, service_name: svc.name });
            break;
          }
        }
      } catch (e) {
        if (!cancelled) console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [preselectedPackageId, cartItems.length, addItem]);

  useEffect(() => {
    let cancelled = false;
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 30);
    axios
      .get(`${API_BASE}/api/availability/`, {
        params: { from_date: from.toISOString(), to_date: to.toISOString() }
      })
      .then((res) => {
        if (!cancelled) setAvailableSlots(res.data);
      })
      .catch(() => {
        if (!cancelled) setAvailableSlots([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const packageIds = cartItems.map((i) => i.id);
    if (packageIds.length === 0) {
      setError('Add at least one package from a service page.');
      return;
    }
    const slot = availableSlots.find((s) => String(s.id) === selectedSlotId);
    if (!slot || !formData.name || !formData.email) {
      setError('Please fill in name, email, and choose an available date & time.');
      return;
    }
    const scheduledDate = new Date(slot.slot_start);
    try {
      const customerRes = await axios.post(`${API_BASE}/api/customers/`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null
      });
      const customerId = customerRes.data.id;
      const payload = {
        customer_id: customerId,
        scheduled_date: scheduledDate.toISOString(),
        notes: formData.notes || null,
        package_ids: packageIds
      };
      if (packageIds.length === 1) {
        await axios.post(`${API_BASE}/api/bookings/`, {
          customer_id: customerId,
          package_id: packageIds[0],
          scheduled_date: payload.scheduled_date,
          notes: payload.notes
        });
      } else {
        await axios.post(`${API_BASE}/api/bookings/multi`, payload);
      }
      clearCart();
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', notes: '' });
      setSelectedSlotId('');
      showToast("Booking submitted! We'll confirm soon.");
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

  if (loading && preselectedPackageId && cartItems.length === 0) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <main className="booking-page">
      <div className="booking-container">
        <h1>Complete your booking</h1>
        {cartItems.length === 0 && !preselectedPackageId ? (
          <div className="booking-empty">
            <p>Your booking list is empty. Choose packages from our services.</p>
            <Link to="/book" className="btn btn-primary">Choose services</Link>
          </div>
        ) : (
          <>
            {submitted && (
              <p className="success-message">Booking request submitted! We'll confirm soon. Payment can be arranged when we confirm.</p>
            )}
            {error && <p className="error-message">{error}</p>}

            <section className="booking-cart">
              <h2>Your selection ({cartItems.length})</h2>
              <ul className="booking-cart-list">
                {cartItems.map((item) => (
                  <li key={item.id} className="booking-cart-item">
                    <div>
                      <strong>{item.service_name} – {item.name}</strong>
                      {item.price != null && (
                        <span className="booking-cart-price"> ${Number(item.price).toFixed(2)}</span>
                      )}
                    </div>
                    <button type="button" className="booking-cart-remove" onClick={() => removeItem(item.id)} aria-label="Remove">
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              {cartItems.length > 0 && (
                <p className="booking-cart-note">Payment can be added when we confirm your booking.</p>
              )}
            </section>

            {cartItems.length > 0 && (
              <form onSubmit={handleSubmit} className="booking-form">
                <h2>Your details</h2>
                <label>Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                <label>Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                <label>Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                <label>Preferred Date & Time *</label>
                {slotsLoading ? (
                  <p className="booking-slots-loading">Loading available times…</p>
                ) : availableSlots.length === 0 ? (
                  <p className="booking-no-slots">No availability set right now. Please contact us to arrange a time.</p>
                ) : (
                  <select
                    value={selectedSlotId}
                    onChange={(e) => setSelectedSlotId(e.target.value)}
                    className="booking-slots-select"
                    required
                  >
                    <option value="">Choose a date & time</option>
                    {availableSlots.map((s) => {
                      const start = new Date(s.slot_start);
                      const label = s.slot_end
                        ? `${start.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} – ${new Date(s.slot_end).toLocaleTimeString(undefined, { timeStyle: 'short' })}`
                        : start.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
                      return (
                        <option key={s.id} value={s.id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                )}
                <label>Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" />
                <button type="submit" className="btn btn-primary">Submit booking request</button>
              </form>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default BookingPage;
