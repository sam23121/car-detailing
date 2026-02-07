import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { API_BASE } from '../config';
import { getAdminHeaders, clearAdminSecret } from './AdminLoginPage';
import './AdminAvailabilityPage.css';

function AdminAvailabilityPage() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [addDateStart, setAddDateStart] = useState(null);
  const [addDateEnd, setAddDateEnd] = useState(null);
  const [addAsDayRange, setAddAsDayRange] = useState(false);
  const [addTimeStart, setAddTimeStart] = useState('09:00');
  const [addTimeEnd, setAddTimeEnd] = useState('');
  const [addAsTimeRange, setAddAsTimeRange] = useState(true);
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
      .get(`${API_BASE}/api/availability`, {
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
      .delete(`${API_BASE}/api/availability/${id}`, { headers: getAdminHeaders() })
      .then(() => fetchSlots())
      .catch((err) => {
        if (err.response?.status === 401) {
          clearAdminSecret();
          navigate('/admin/login', { state: { message: 'Please log in again.' }, replace: true });
          return;
        }
        setError(err.response?.data?.detail || err.message);
      })
      .finally(() => setDeletingId(null));
  };

  const getDaysInRange = (start, end) => {
    const days = [];
    const d = new Date(start);
    d.setHours(0, 0, 0, 0);
    const endCopy = new Date(end);
    endCopy.setHours(0, 0, 0, 0);
    while (d <= endCopy) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddError(null);
    const start = addAsDayRange ? addDateStart : addDateStart;
    const end = addAsDayRange ? addDateEnd : addDateStart;
    if (!start) {
      setAddError('Pick a date.');
      return;
    }
    if (addAsDayRange && (!end || end < start)) {
      setAddError('End date must be on or after start date.');
      return;
    }
    const [startH, startMin] = addTimeStart.split(':').map(Number);
    let endH = null, endMin = null;
    if (addAsTimeRange && addTimeEnd) {
      [endH, endMin] = addTimeEnd.split(':').map(Number);
    }
    const days = addAsDayRange ? getDaysInRange(start, end) : [start];
    if (days.length > 31) {
      setAddError('Maximum 31 days in one range.');
      return;
    }
    setSubmitting(true);
    try {
      for (const day of days) {
        const y = day.getFullYear(), m = day.getMonth(), d = day.getDate();
        const slotStart = new Date(y, m, d, startH, startMin, 0, 0);
        let slotEnd = null;
        if (endH != null && endMin != null) {
          slotEnd = new Date(y, m, d, endH, endMin, 0, 0);
          if (slotEnd <= slotStart) {
            setAddError('End time must be after start time.');
            setSubmitting(false);
            return;
          }
        }
        await axios.post(
          `${API_BASE}/api/availability`,
          {
            slot_start: slotStart.toISOString(),
            slot_end: slotEnd ? slotEnd.toISOString() : null
          },
          { headers: getAdminHeaders() }
        );
      }
      fetchSlots();
      setAddDateStart(null);
      setAddDateEnd(null);
      setAddTimeStart('09:00');
      setAddTimeEnd('');
    } catch (err) {
      const d = err.response?.data?.detail;
      setAddError(Array.isArray(d) ? d.map((x) => x.msg || JSON.stringify(x)).join(' ') : d || err.message);
    } finally {
      setSubmitting(false);
    }
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
            <div className="admin-availability-form-row admin-availability-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={addAsDayRange}
                  onChange={(e) => setAddAsDayRange(e.target.checked)}
                />
                Add a range of days (same time each day)
              </label>
            </div>
            {addAsDayRange ? (
              <>
                <div className="admin-availability-form-row">
                  <label>Start date</label>
                  <DatePicker
                    selected={addDateStart}
                    onChange={(d) => setAddDateStart(d)}
                    selectsStart
                    startDate={addDateStart}
                    endDate={addDateEnd}
                    minDate={new Date()}
                    dateFormat="MMMM d, yyyy"
                    placeholderText="Pick start date"
                    className="admin-availability-datepicker"
                  />
                </div>
                <div className="admin-availability-form-row">
                  <label>End date</label>
                  <DatePicker
                    selected={addDateEnd}
                    onChange={(d) => setAddDateEnd(d)}
                    selectsEnd
                    startDate={addDateStart}
                    endDate={addDateEnd}
                    minDate={addDateStart || new Date()}
                    dateFormat="MMMM d, yyyy"
                    placeholderText="Pick end date"
                    className="admin-availability-datepicker"
                  />
                </div>
              </>
            ) : (
              <div className="admin-availability-form-row">
                <label>Date</label>
                <DatePicker
                  selected={addDateStart}
                  onChange={(d) => setAddDateStart(d)}
                  minDate={new Date()}
                  dateFormat="MMMM d, yyyy"
                  placeholderText="Pick date"
                  className="admin-availability-datepicker"
                />
              </div>
            )}
            <div className="admin-availability-form-row">
              <label>Start time</label>
              <input
                type="time"
                value={addTimeStart}
                onChange={(e) => setAddTimeStart(e.target.value)}
                required
              />
            </div>
            {addAsTimeRange && (
              <div className="admin-availability-form-row">
                <label>End time</label>
                <input
                  type="time"
                  value={addTimeEnd}
                  onChange={(e) => setAddTimeEnd(e.target.value)}
                />
              </div>
            )}
            <div className="admin-availability-form-row admin-availability-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={addAsTimeRange}
                  onChange={(e) => setAddAsTimeRange(e.target.checked)}
                />
                Add as time range (optional end time)
              </label>
            </div>
            {addError && <p className="admin-availability-add-error">{addError}</p>}
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Adding…' : addAsDayRange && addDateStart && addDateEnd
                ? `Add ${getDaysInRange(addDateStart, addDateEnd).length} slots`
                : 'Add slot'}
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
