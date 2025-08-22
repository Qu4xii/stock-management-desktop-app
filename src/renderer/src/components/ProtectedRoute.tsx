// File: src/renderer/src/components/ProtectedRoute.tsx

import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { StaffRole } from '../types' // Import the StaffRole type

function ProtectedRoute() {
  const { currentUser } = useAuth()
  const location = useLocation()

  // Case 1: No user is logged in.
  // Redirect them to the login page.
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Case 2: User is logged in, but their role is 'Not Assigned'.
  // Redirect them to the waiting page. We must also make sure they aren't *already* on
  // the waiting page to avoid an infinite redirect loop.
  const isNotAssigned = currentUser.role === ('Not Assigned' as StaffRole)
  if (isNotAssigned && location.pathname !== '/waiting-for-approval') {
    return <Navigate to="/waiting-for-approval" replace />
  }

  // Case 3: User is logged in and has an assigned role.
  // Allow them to access the main application content.
  return <Outlet />
}

export default ProtectedRoute