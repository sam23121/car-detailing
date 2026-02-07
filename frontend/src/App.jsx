import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ServicePage from './pages/ServicePage';
import BookingPage from './pages/BookingPage';
import BlogPage from './pages/BlogPage';
import RequireAdmin from './components/RequireAdmin';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminAvailabilityPage from './pages/AdminAvailabilityPage';
import BookServiceSelectPage from './pages/BookServiceSelectPage';
import './App.css';

function App() {
  return (
    <CartProvider>
    <ToastProvider>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<BookServiceSelectPage />} />
        <Route path="/services/:slug" element={<ServicePage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<RequireAdmin><AdminDashboardPage /></RequireAdmin>} />
        <Route path="/admin/bookings" element={<RequireAdmin><AdminBookingsPage /></RequireAdmin>} />
        <Route path="/admin/availability" element={<RequireAdmin><AdminAvailabilityPage /></RequireAdmin>} />
      </Routes>
      <Footer />
    </Router>
    </ToastProvider>
    </CartProvider>
  );
}

export default App;
