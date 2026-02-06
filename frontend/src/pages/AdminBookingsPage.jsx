import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminBookingsPage.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchBookings = () => {
    setError(null);
    axios
      .get(`${API_BASE}/api/bookings/with-details?limit=100`)
      .then((res) => setBookings(res.data))
      .catch((err) => setError(err.message || 'Failed to load bookings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = (bookingId, newStatus) => {
    const b = bookings.find((x) => x.id === bookingId);
    if (!b) return;
    setUpdatingId(bookingId);
    axios
      .put(`${API_BASE}/api/bookings/${bookingId}`, {
        customer_id: b.customer_id,
        package_id: b.package_id,
        scheduled_date: b.scheduled_date,
        status: newStatus,
        notes: b.notes || null,
      })
      .then(() => fetchBookings())
      .catch((err) => setError(err.response?.data?.detail || err.message))
      .finally(() => setUpdatingId(null));
  };

  const formatDate = (s) => {
    if (!s) return '—';
    const d = new Date(s);
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (loading) return <div className="admin-bookings loading">Loading bookings...</div>;
  if (error) return <div className="admin-bookings error">{error}</div>;

  return (
    <main className="admin-bookings">
      <div className="admin-bookings-container">
        <h1>Bookings (Owner)</h1>
        <p className="admin-bookings-intro">
          New requests appear here. Confirm or cancel from this page. Data is stored in your database (customers + bookings tables).
        </p>
        {bookings.length === 0 ? (
          <p className="admin-bookings-empty">No bookings yet.</p>
        ) : (
          <div className="admin-bookings-table-wrap">
            <table className="admin-bookings-table">
              <thead>
                <tr>
                  <th>Date / Time</th>
                  <th>Customer</th>
                  <th>Package</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>{formatDate(b.scheduled_date)}</td>
                    <td>
                      <strong>{b.customer?.name ?? '—'}</strong>
                      <br />
                      <a href={`mailto:${b.customer?.email}`}>{b.customer?.email ?? '—'}</a>
                      {b.customer?.phone && (
                        <>
                          <br />
                          <a href={`tel:${b.customer.phone}`}>{b.customer.phone}</a>
                        </>
                      )}
                    </td>
                    <td>
                      {b.package?.name ?? `Package #${b.package_id}`}
                      {b.package?.price != null && (
                        <span className="admin-price"> ${Number(b.package.price).toFixed(2)}</span>
                      )}
                    </td>
                    <td>
                      <span className={`admin-status admin-status-${b.status}`}>{b.status}</span>
                    </td>
                    <td>
                      {b.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => updateStatus(b.id, 'confirmed')}
                            disabled={updatingId === b.id}
                          >
                            {updatingId === b.id ? '…' : 'Confirm'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => updateStatus(b.id, 'cancelled')}
                            disabled={updatingId === b.id}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {b.status === 'confirmed' && (
                        <span className="admin-confirmed">Confirmed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default AdminBookingsPage;
