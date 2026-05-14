import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE, formatDateInDC, formatTimeInDC } from '../config';
import { clearAdminSecret, getAdminHeaders } from './AdminLoginPage';
import './AdminDashboardPage.css';

function statusBadgeClass(status) {
  if (status === 'completed') return 'admin-status admin-status-completed';
  if (status === 'cancelled') return 'admin-status admin-status-cancelled';
  if (status === 'confirmed') return 'admin-status admin-status-confirmed';
  return 'admin-status admin-status-pending';
}

function statusLabel(status) {
  if (status === 'completed') return 'Completed';
  if (status === 'cancelled') return 'Cancelled';
  if (status === 'confirmed') return 'Confirmed';
  return 'Pending';
}

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    setLoading(true);
    axios
      .get(`${API_BASE}/api/admin/dashboard/stats`, { headers: getAdminHeaders() })
      .then((res) => setData(res.data))
      .catch((err) => {
        const d = err.response?.data?.detail;
        setError(typeof d === 'string' ? d : err.message || 'Could not load dashboard statistics.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleLogout = () => {
    clearAdminSecret();
    navigate('/admin/login', { replace: true });
  };

  const topService = data?.most_booked_service ?? '—';

  return (
    <main className="admin-dashboard">
      <div className="admin-dashboard-container">
        <div className="admin-dashboard-header">
          <h1>Dashboard</h1>
          <button type="button" className="admin-dashboard-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
        <p className="admin-dashboard-intro">Overview of bookings and activity.</p>

        <nav className="admin-dashboard-nav" aria-label="Admin sections">
          <Link to="/admin/bookings">Bookings</Link>
          <span className="admin-dashboard-nav-sep" aria-hidden>
            ·
          </span>
          <Link to="/admin/availability">Availability</Link>
        </nav>

        {error && (
          <div className="admin-dashboard-error" role="alert">
            <p>{error}</p>
            <button type="button" className="admin-dashboard-retry" onClick={() => load()}>
              Try again
            </button>
          </div>
        )}

        {!error && (
          <>
            <div className="admin-dashboard-stats">
              {loading ? (
                <>
                  <div className="admin-dashboard-stat-skeleton" />
                  <div className="admin-dashboard-stat-skeleton" />
                  <div className="admin-dashboard-stat-skeleton" />
                  <div className="admin-dashboard-stat-skeleton" />
                </>
              ) : (
                <>
                  <div className="admin-dashboard-stat-card">
                    <p className="admin-dashboard-stat-label">Bookings this month</p>
                    <p className="admin-dashboard-stat-value">{data?.total_this_month ?? 0}</p>
                  </div>
                  <div className="admin-dashboard-stat-card">
                    <p className="admin-dashboard-stat-label">Upcoming (next 7 days)</p>
                    <p className="admin-dashboard-stat-value">{data?.upcoming_next_7_days ?? 0}</p>
                  </div>
                  <div className="admin-dashboard-stat-card admin-dashboard-stat-card-warn">
                    <p className="admin-dashboard-stat-label">Cancelled this month</p>
                    <p className="admin-dashboard-stat-value admin-dashboard-stat-value-warn">
                      {data?.cancelled_this_month ?? 0}
                    </p>
                  </div>
                  <div className="admin-dashboard-stat-card">
                    <p className="admin-dashboard-stat-label">Top service (this month)</p>
                    <p className="admin-dashboard-stat-value-text">{topService}</p>
                  </div>
                </>
              )}
            </div>

            <section className="admin-dashboard-recent">
              <div className="admin-dashboard-recent-header">
                <h2>Recent bookings</h2>
                <Link to="/admin/bookings" className="admin-dashboard-view-all">
                  View all
                </Link>
              </div>
              {loading ? (
                <div className="admin-dashboard-table-skeleton" />
              ) : (
                <div className="admin-dashboard-table-wrap">
                  <table className="admin-dashboard-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Client</th>
                        <th>Service</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.recent_appointments ?? []).map((row) => (
                        <tr key={row.id}>
                          <td>{formatDateInDC(row.scheduled_date, { dateStyle: 'medium' })}</td>
                          <td className="admin-dashboard-mono">{formatTimeInDC(row.scheduled_date, { timeStyle: 'short' })}</td>
                          <td>{row.client_name}</td>
                          <td>{row.service_label}</td>
                          <td>
                            <span className={statusBadgeClass(row.status)}>{statusLabel(row.status)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!data?.recent_appointments?.length && (
                    <p className="admin-dashboard-empty">No recent bookings yet.</p>
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default AdminDashboardPage;
