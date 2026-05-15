import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, token, isLoading } = useSelector(state => state.auth);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!token || !user) {
    toast.error('Please login to access this page');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    toast.error(`Access denied. ${user.role}s cannot access this page.`);
    
    // Redirect based on role
    if (user.role === 'vendor') {
      return <Navigate to="/vendor/dashboard" replace />;
    } else if (user.role === 'customer') {
      return <Navigate to="/shop" replace />;
    } else if (user.role === 'super_admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;