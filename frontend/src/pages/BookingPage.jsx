import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
    location: '',
    notes: ''
  });
  const [bookableSlots, setBookableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [selectedSlotKey, setSelectedSlotKey] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  // Fetch bookable start times (admin slots broken into 30-min options; duration = package turnaround sum + 2h)
  useEffect(() => {
    if (cartItems.length === 0) {
      setBookableSlots([]);
      setSlotsLoading(false);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 30);
    const params = {
      from_date: from.toISOString(),
      to_date: to.toISOString(),
      ...(cartItems.length > 0 ? { package_ids: cartItems.map((i) => i.id) } : {})
    };
    axios
      .get(`${API_BASE}/api/availability/bookable-slots`, { params })
      .then((res) => {
        if (!cancelled) setBookableSlots(res.data);
      })
      .catch(() => {
        if (!cancelled) setBookableSlots([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => { cancelled = true; };
  }, [cartItems]);

  const slotsByDay = useMemo(() => {
    const map = {};
    bookableSlots.forEach((s) => {
      const d = new Date(s.start);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    return map;
  }, [bookableSlots]);

  useEffect(() => {
    if (!selectedDate && bookableSlots.length > 0) {
      setSelectedDate(new Date(bookableSlots[0].start));
    }
  }, [bookableSlots, selectedDate]);

  const selectedDayKey = selectedDate ? selectedDate.toISOString().slice(0, 10) : null;
  const slotsForSelectedDay = selectedDayKey ? slotsByDay[selectedDayKey] || [] : [];

  const hasSlotsForDay = (date) => {
    const key = date.toISOString().slice(0, 10);
    return !!slotsByDay[key];
  };

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
    const selected = bookableSlots.find((s) => `${s.start}_${s.available_slot_id}` === selectedSlotKey);
    if (!selected || !formData.name || !formData.email) {
      setError('Please fill in name, email, and choose an available date & time.');
      return;
    }
    const scheduledDate = new Date(selected.start);
    setSubmitting(true);
    try {
      const customerRes = await axios.post(`${API_BASE}/api/customers/`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null
      });
      const customerId = customerRes.data.id;
      const slotIdNum = selected.available_slot_id;
      const payload = {
        customer_id: customerId,
        scheduled_date: scheduledDate.toISOString(),
        notes: formData.notes || null,
        package_ids: packageIds,
        available_slot_id: slotIdNum
      };
      if (packageIds.length === 1) {
        await axios.post(`${API_BASE}/api/bookings/`, {
          customer_id: customerId,
          package_id: packageIds[0],
          scheduled_date: payload.scheduled_date,
          notes: payload.notes,
          available_slot_id: slotIdNum
        });
      } else {
        await axios.post(`${API_BASE}/api/bookings/multi`, payload);
      }
      clearCart();
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', location: '', notes: '' });
      setSelectedSlotKey('');
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
    } finally {
      setSubmitting(false);
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
              <p className="success-message">Booking request submitted! We'll confirm soon. We accept payment in person.</p>
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
                <p className="booking-cart-note">We accept payment in person.</p>
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
                <label>Service location (address where you want the service)</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. 123 Main St, City"
                />
                <label>Preferred Date & Time *</label>
                {slotsLoading ? (
                  <p className="booking-slots-loading">Loading available times…</p>
                ) : bookableSlots.length === 0 ? (
                  <p className="booking-no-slots">No availability in this window, or add packages to see times (slots are based on your selection’s turnaround + 2 hours).</p>
                ) : (
                  <div className="booking-slots-picker">
                    <div className="booking-slots-date">
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => {
                          setSelectedDate(date);
                          setSelectedSlotKey('');
                        }}
                        filterDate={hasSlotsForDay}
                        minDate={new Date()}
                        dateFormat="MMMM d, yyyy"
                        placeholderText="Choose a date"
                        className="booking-slots-datepicker"
                      />
                    </div>
                    {selectedDate && slotsForSelectedDay.length > 0 && (
                      <select
                        value={selectedSlotKey}
                        onChange={(e) => setSelectedSlotKey(e.target.value)}
                        className="booking-slots-select"
                        required
                      >
                        <option value="">Choose a time</option>
                        {slotsForSelectedDay.map((s) => {
                          const start = new Date(s.start);
                          const key = `${s.start}_${s.available_slot_id}`;
                          return (
                            <option key={key} value={key}>
                              {start.toLocaleTimeString(undefined, { timeStyle: 'short' })}
                            </option>
                          );
                        })}
                      </select>
                    )}
                    {selectedDate && slotsForSelectedDay.length === 0 && (
                      <p className="booking-no-slots">No times available for this day.</p>
                    )}
                  </div>
                )}
                <label>Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" />
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <span className="booking-submit-loading">
                      <span className="booking-spinner" aria-hidden="true" /> Submitting…
                    </span>
                  ) : (
                    'Submit booking request'
                  )}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default BookingPage;
