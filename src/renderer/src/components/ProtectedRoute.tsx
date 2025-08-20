// In src/renderer/src/components/ProtectedRoute.tsx

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute() {
  const { currentUser } = useAuth();
  const location = useLocation();

  // If there's no user, redirect them to the login page.
  // We also pass the current location they were trying to access,
  // so we can redirect them back after they log in (optional but good UX).
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a user is logged in, render the child routes (your main App layout).
  return <Outlet />;
}

export default ProtectedRoute;