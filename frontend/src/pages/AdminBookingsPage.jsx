import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE, formatInDC, formatDateInDC } from '../config';
import { getAdminHeaders } from './AdminLoginPage';
import './AdminBookingsPage.css';

function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchBookings = () => {
    setError(null);
    axios
      .get(`${API_BASE}/api/bookings/with-details?limit=100`, { headers: getAdminHeaders() })
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
    const payload = {
      customer_id: b.customer_id,
      package_id: b.package_id ?? null,
      scheduled_date: b.scheduled_date,
      status: newStatus,
      location: b.location || null,
      notes: b.notes || null,
    };
    axios
      .put(
        `${API_BASE}/api/bookings/${bookingId}`,
        payload,
        { headers: getAdminHeaders() }
      )
      .then(() => fetchBookings())
      .catch((err) => setError(err.response?.data?.detail || err.message))
      .finally(() => setUpdatingId(null));
  };

  const formatDate = (s) => {
    if (!s) return '—';
    return formatInDC(s, { dateStyle: 'medium', timeStyle: 'short' });
  };

  if (loading) return <div className="admin-bookings loading">Loading bookings...</div>;
  if (error) return <div className="admin-bookings error">{error}</div>;

  return (
    <main className="admin-bookings">
      <div className="admin-bookings-container">
        <p className="admin-bookings-back">
          <Link to="/admin">← Admin</Link>
        </p>
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
                  <th>Address</th>
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
                    <td>{b.location ? <span className="admin-location">{b.location}</span> : '—'}</td>
                    <td>
                      {b.booking_items && b.booking_items.length > 0 ? (
                        <ul className="admin-packages-list">
                          {b.booking_items.map((item) => {
                            const label = item.package?.service_name
                              ? `${item.package.service_name} – ${item.package.name}`
                              : (item.package?.name ?? `#${item.package_id}`);
                            return (
                              <li key={item.id}>
                                {label}
                                {item.package?.price != null && (
                                  <span className="admin-price"> ${Number(item.package.price).toFixed(2)}</span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <>
                          {b.package?.service_name
                            ? `${b.package.service_name} – ${b.package.name}`
                            : (b.package?.name ?? (b.package_id ? `Package #${b.package_id}` : '—'))}
                          {b.package?.price != null && (
                            <span className="admin-price"> ${Number(b.package.price).toFixed(2)}</span>
                          )}
                        </>
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
                        <>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => updateStatus(b.id, 'completed')}
                            disabled={updatingId === b.id}
                          >
                            {updatingId === b.id ? '…' : 'Mark completed'}
                          </button>
                          <span className="admin-confirmed">Confirmed</span>
                        </>
                      )}
                      {b.status === 'completed' && (
                        <span className="admin-status admin-status-completed">
                          Completed
                          {b.completed_at && (
                            <span className="admin-completed-at">
                              {' '}({formatDateInDC(b.completed_at)})
                            </span>
                          )}
                        </span>
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
