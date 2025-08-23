// File: src/renderer/src/main.tsx (Corrected)

import React from 'react'
import ReactDOM from 'react-dom/client'
import { createHashRouter, RouterProvider, Outlet } from 'react-router-dom'
import './assets/index.css'
import { ThemeProvider } from './components/ThemeProvider'
import { AuthProvider } from './context/AuthContext'

// Import all pages and components
import App from './App'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import ClientsPage from './pages/ClientsPage'
import ProductsPage from './pages/ProductsPage'
import StaffPage from './pages/StaffPage'
import HistoryPage from './pages/HistoryPage'
import RepairsPage from './pages/RepairsPage'
import ProfilePage from './pages/ProfilePage'
// We no longer need to import WaitingForApprovalPage here.

const router = createHashRouter([
  // --- Public routes ---
  // These routes do NOT go through the ProtectedRoute
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/signup',
    element: <SignupPage />
  },

  // --- Protected Application Entry Point ---
  // This single route definition handles ALL authenticated states.
  {
    path: '/',
    element: <ProtectedRoute />, // The "gatekeeper" is the parent element.
    children: [
      // If the user is approved, the <Outlet /> in ProtectedRoute will render this:
      {
        path: '/',
        element: <App />, // Your main layout with sidebar
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'clients', element: <ClientsPage /> },
          { path: 'products', element: <ProductsPage /> },
          { path: 'staff', element: <StaffPage /> },
          { path: 'history', element: <HistoryPage /> },
          { path: 'repairs', element: <RepairsPage /> },
          { path: 'profile', element: <ProfilePage /> }
        ]
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-react-electron-theme">
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
)