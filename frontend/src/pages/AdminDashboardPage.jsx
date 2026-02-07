import React from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboardPage.css';

function AdminDashboardPage() {
  return (
    <main className="admin-dashboard">
      <div className="admin-dashboard-container">
        <h1>Admin</h1>
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
