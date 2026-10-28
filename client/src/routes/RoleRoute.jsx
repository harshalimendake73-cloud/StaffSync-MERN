import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const RoleRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default RoleRoute;

