import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';
import './AdminAvailabilityPage.css';

function AdminAvailabilityPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [addDate, setAddDate] = useState('');
  const [addTimeStart, setAddTimeStart] = useState('09:00');
  const [addTimeEnd, setAddTimeEnd] = useState('');
  const [addAsRange, setAddAsRange] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addError, setAddError] = useState(null);

  const fetchSlots = () => {
    setError(null);
    const now = new Date();
    const to = new Date(now);
    to.setDate(to.getDate() + 60);
    const fromStr = now.toISOString();
    const toStr = to.toISOString();
    axios
      .get(`${API_BASE}/api/availability/`, {
        params: { from_date: fromStr, to_date: toStr }
      })
      .then((res) => setSlots(res.data))
      .catch((err) => setError(err.message || 'Failed to load slots'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const formatSlot = (slot) => {
    const start = new Date(slot.slot_start);
    const opts = { dateStyle: 'medium', timeStyle: 'short' };
    if (slot.slot_end) {
      const end = new Date(slot.slot_end);
      return `${start.toLocaleString(undefined, opts)} – ${end.toLocaleTimeString(undefined, { timeStyle: 'short' })}`;
    }
    return start.toLocaleString(undefined, opts);
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    axios
      .delete(`${API_BASE}/api/availability/${id}`)
      .then(() => fetchSlots())
      .catch((err) => setError(err.response?.data?.detail || err.message))
      .finally(() => setDeletingId(null));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    setAddError(null);
    if (!addDate.trim()) {
      setAddError('Pick a date.');
      return;
    }
    const [y, m, d] = addDate.split('-').map(Number);
    const [startH, startMin] = addTimeStart.split(':').map(Number);
    const slotStart = new Date(y, m - 1, d, startH, startMin, 0, 0);
    if (isNaN(slotStart.getTime())) {
      setAddError('Invalid date or time.');
      return;
    }
    let slotEnd = null;
    if (addAsRange && addTimeEnd) {
      const [endH, endMin] = addTimeEnd.split(':').map(Number);
      slotEnd = new Date(y, m - 1, d, endH, endMin, 0, 0);
      if (slotEnd <= slotStart) {
        setAddError('End time must be after start time.');
        return;
      }
    }
    setSubmitting(true);
    axios
      .post(`${API_BASE}/api/availability/`, {
        slot_start: slotStart.toISOString(),
        slot_end: slotEnd ? slotEnd.toISOString() : null
      })
      .then(() => {
        fetchSlots();
        setAddDate('');
        setAddTimeStart('09:00');
        setAddTimeEnd('');
      })
      .catch((err) => {
        const d = err.response?.data?.detail;
        setAddError(Array.isArray(d) ? d.map((x) => x.msg || JSON.stringify(x)).join(' ') : d || err.message);
      })
      .finally(() => setSubmitting(false));
  };

  if (loading) return <div className="admin-availability loading">Loading availability...</div>;
  if (error) return <div className="admin-availability error">{error}</div>;

  return (
    <main className="admin-availability">
      <div className="admin-availability-container">
        <p className="admin-availability-back">
          <Link to="/admin">← Admin</Link>
        </p>
        <h1>Set availability</h1>
        <p className="admin-availability-intro">
          Add date/time slots that customers can choose when booking. Only these slots will appear on the booking page.
        </p>

        <section className="admin-availability-form-section">
          <h2>Add a slot</h2>
          <form onSubmit={handleAdd} className="admin-availability-form">
            <div className="admin-availability-form-row">
              <label>Date</label>
              <input
                type="date"
                value={addDate}
                onChange={(e) => setAddDate(e.target.value)}
                required
              />
            </div>
            <div className="admin-availability-form-row">
              <label>Start time</label>
              <input
                type="time"
                value={addTimeStart}
                onChange={(e) => setAddTimeStart(e.target.value)}
                required
              />
            </div>
            <div className="admin-availability-form-row admin-availability-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={addAsRange}
                  onChange={(e) => setAddAsRange(e.target.checked)}
                />
                Add as time range (optional end time)
              </label>
            </div>
            {addAsRange && (
              <div className="admin-availability-form-row">
                <label>End time</label>
                <input
                  type="time"
                  value={addTimeEnd}
                  onChange={(e) => setAddTimeEnd(e.target.value)}
                />
              </div>
            )}
            {addError && <p className="admin-availability-add-error">{addError}</p>}
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Adding…' : 'Add slot'}
            </button>
          </form>
        </section>

        <section className="admin-availability-list-section">
          <h2>Upcoming slots (next 60 days)</h2>
          {slots.length === 0 ? (
            <p className="admin-availability-empty">No slots yet. Add some above so customers can book.</p>
          ) : (
            <ul className="admin-availability-list">
              {slots.map((slot) => (
                <li key={slot.id} className="admin-availability-item">
                  <span className="admin-availability-slot-label">{formatSlot(slot)}</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDelete(slot.id)}
                    disabled={deletingId === slot.id}
                  >
                    {deletingId === slot.id ? '…' : 'Remove'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

export default AdminAvailabilityPage;
