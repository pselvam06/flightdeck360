import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Flights from './pages/Flights';
import BookFlight from './pages/BookFlight';
import MyBookings from './pages/MyBookings';
import AdminFlights from './pages/AdminFlights';
import AdminBookings from './pages/AdminBookings';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/flights" element={<Flights />} />

              {/* Protected Passenger Routes */}
              <Route 
                path="/book-flight/:flightId" 
                element={
                  <ProtectedRoute>
                    <BookFlight />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-bookings" 
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Routes */}
              <Route 
                path="/admin/flights" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminFlights />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/bookings" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminBookings />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <ToastContainer position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;