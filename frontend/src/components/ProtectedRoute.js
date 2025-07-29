import React from 'react';
import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../utils/auth';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children, role }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  if (role) {
    try {
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      if (decoded.role !== role) {
        return <Navigate to="/login" replace />;
      }
    } catch {
      return <Navigate to="/login" replace />;
    }
  }
  return children;
};

export default ProtectedRoute; 