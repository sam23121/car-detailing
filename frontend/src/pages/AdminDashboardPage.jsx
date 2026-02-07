import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearAdminSecret } from './AdminLoginPage';
import './AdminDashboardPage.css';

function AdminDashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAdminSecret();
    navigate('/admin/login', { replace: true });
  };

  return (
    <main className="admin-dashboard">
      <div className="admin-dashboard-container">
        <div className="admin-dashboard-header">
          <h1>Admin</h1>
          <button type="button" className="admin-dashboard-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
        <p className="admin-dashboard-intro">
          Manage bookings and set when customers can book.
        </p>
        <nav className="admin-dashboard-links">
          <Link to="/admin/bookings" className="admin-dashboard-card">
            <h2>Bookings</h2>
            <p>View and confirm or cancel booking requests.</p>
          </Link>
          <Link to="/admin/availability" className="admin-dashboard-card">
            <h2>Set availability</h2>
            <p>Add or remove available date/time slots for customers.</p>
          </Link>
        </nav>
      </div>
    </main>
  );
}

export default AdminDashboardPage;
