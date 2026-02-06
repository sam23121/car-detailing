import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ServicePage from './pages/ServicePage';
import BookingPage from './pages/BookingPage';
import BlogPage from './pages/BlogPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services/:slug" element={<ServicePage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/admin/bookings" element={<AdminBookingsPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
