// File: src/renderer/src/components/ProtectedRoute.tsx (Corrected)

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import WaitingForApprovalPage from '../pages/WaitingForApprovalPage' // We'll render this directly

function ProtectedRoute() {
  const { currentUser } = useAuth()

  // Case 1: No user is logged in.
  // Redirect them to the login page immediately. This is the key for logout redirection.
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // Case 2: User is logged in, but their role is 'Not Assigned'.
  // Instead of redirecting, this component will now RENDER the waiting page.
  if (currentUser.role === 'Not Assigned') {
    return <WaitingForApprovalPage />
  }

  // Case 3: User is logged in and has an approved role.
  // Render the <Outlet />, which will be the main <App /> layout.
  return <Outlet />
}

export default ProtectedRoute