// In src/renderer/src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider, Outlet } from 'react-router-dom';
import './assets/index.css';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './context/AuthContext'; // Correctly import AuthProvider

// Import all pages and components
import App from './App';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import ProductsPage from './pages/ProductsPage';
import StaffPage from './pages/StaffPage';
import HistoryPage from './pages/HistoryPage';
import RepairsPage from './pages/RepairsPage';

// --- THIS IS THE FIX ---
// 1. Create a Root component that provides the context.
//    The <Outlet /> will render the matched child route (e.g., LoginPage or ProtectedRoute).
const Root = () => {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
};

// 2. Restructure the router.
const router = createHashRouter([
  {
    path: '/',
    element: <Root />, // The Root component is now the entry point.
    children: [
      // Public routes are now direct children
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'signup',
        element: <SignupPage />,
      },
      // The ProtectedRoute now correctly sits inside the AuthProvider's context.
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <App />, // Your main layout with sidebar
            children: [
              // All your protected pages
              {
                index: true, // This makes Dashboard the default for "/"
                element: <DashboardPage />,
              },
              {
                path: 'clients',
                element: <ClientsPage />,
              },
              {
                path: 'products',
                element: <ProductsPage />,
              },
              {
                path: 'staff',
                element: <StaffPage />,
              },
              {
                path: 'history',
                element: <HistoryPage />,
              },
              {
                path: 'repairs',
                element: <RepairsPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* ThemeProvider can remain the outermost provider */}
    <ThemeProvider defaultTheme="dark" storageKey="vite-react-electron-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);