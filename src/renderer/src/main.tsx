// File: src/renderer/src/main.tsx

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
// [PERMISSIONS] Import the new waiting page
import WaitingForApprovalPage from './pages/WaitingForApprovalPage'

const Root = () => {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

const router = createHashRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      // --- Public routes ---
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'signup',
        element: <SignupPage />
      },
      // [PERMISSIONS] Add the new waiting page as a public route
      {
        path: 'waiting-for-approval',
        element: <WaitingForApprovalPage />
      },

      // --- Protected application routes ---
      {
        element: <ProtectedRoute />, // The guard that checks authentication AND role
        children: [
          {
            element: <App />, // Your main layout with sidebar
            children: [
              {
                index: true,
                element: <DashboardPage />
              },
              {
                path: 'clients',
                element: <ClientsPage />
              },
              {
                path: 'products',
                element: <ProductsPage />
              },
              {
                path: 'staff',
                element: <StaffPage />
              },
              {
                path: 'history',
                element: <HistoryPage />
              },
              {
                path: 'repairs',
                element: <RepairsPage />
              },
              {
                path: 'profile',
                element: <ProfilePage />
              }
            ]
          }
        ]
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-react-electron-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
)