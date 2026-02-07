import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAdminAuthenticated } from '../pages/AdminLoginPage';

export default function RequireAdmin({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login', { state: { from: location }, replace: true });
    }
  }, [navigate, location]);

  if (!isAdminAuthenticated()) {
    return (
      <div className="admin-loading" style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
        Checking access…
      </div>
    );
  }

  return children;
}
