import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Feedback from './pages/Feedback';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { isLoggedIn, logout } from './utils/auth';
import './App.css';

function App() {
  return (
    <Router>
      <nav style={{ padding: '1rem', background: '#f0f0f0', marginBottom: '2rem' }}>
        <Link to="/login" style={{ marginRight: 16 }}>Login</Link>
        <Link to="/register" style={{ marginRight: 16 }}>Register</Link>
        <Link to="/feedback" style={{ marginRight: 16 }}>Feedback</Link>
        <Link to="/admin">Admin Dashboard</Link>
        {isLoggedIn() && (
          <button onClick={logout} style={{ marginLeft: 16 }}>Logout</button>
        )}
      </nav>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/feedback" element={
          <ProtectedRoute>
            <Feedback />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
