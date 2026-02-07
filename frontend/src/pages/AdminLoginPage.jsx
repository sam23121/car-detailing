import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';
import './AdminLoginPage.css';

const ADMIN_SECRET_KEY = 'adminSecret';

export function getAdminHeaders() {
  const secret = typeof window !== 'undefined' ? sessionStorage.getItem(ADMIN_SECRET_KEY) : null;
  if (!secret) return {};
  return { 'X-Admin-Secret': secret };
}

export function setAdminSecret(secret) {
  sessionStorage.setItem(ADMIN_SECRET_KEY, secret);
}

export function clearAdminSecret() {
  sessionStorage.removeItem(ADMIN_SECRET_KEY);
}

export function isAdminAuthenticated() {
  return typeof window !== 'undefined' && !!sessionStorage.getItem(ADMIN_SECRET_KEY);
}

function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!password.trim()) {
      setError('Enter the admin password.');
      return;
    }
    setLoading(true);
    axios
      .get(`${API_BASE}/api/bookings/with-details?limit=1`, {
        headers: { 'X-Admin-Secret': password.trim() }
      })
      .then(() => {
        setAdminSecret(password.trim());
        const from = location.state?.from?.pathname || '/admin';
        navigate(from, { replace: true });
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          setError('Incorrect password.');
        } else {
          setError(err.message || 'Something went wrong.');
        }
      })
      .finally(() => setLoading(false));
  };

  const message = location.state?.message;

  return (
    <main className="admin-login">
      <div className="admin-login-container">
        <h1>Admin login</h1>
        <p className="admin-login-intro">Enter the admin password to continue.</p>
        {message && <p className="admin-login-message">{message}</p>}
        <form onSubmit={handleSubmit} className="admin-login-form">
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            autoComplete="current-password"
            disabled={loading}
          />
          {error && <p className="admin-login-error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Checking…' : 'Log in'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default AdminLoginPage;
