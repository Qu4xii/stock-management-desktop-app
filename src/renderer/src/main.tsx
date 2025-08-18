// In src/renderer/src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';

// --- STYLES AND GLOBAL PROVIDERS ---
import './assets/index.css'; 
import { ThemeProvider } from './components/ThemeProvider';

// --- ROOT APP AND PAGE COMPONENT IMPORTS ---
import App from './App'; 
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import ProductsPage from './pages/ProductsPage'; 
import StaffPage from './pages/StaffPage';
import HistoryPage from './pages/HistoryPage';
import RepairsPage from './pages/RepairsPage';

/**
 * This is the router configuration for your application.
 * All routes are defined in this single structure.
 */
const router = createHashRouter([
  {
    // --- THIS IS THE SINGLE, CORRECT ROOT ROUTE ---
    path: '/',
    element: <App />,
    // All pages are children of the root layout
    children: [
      {
        index: true, // Default page
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
        path: 'repairs', // <-- ADD THIS NEW ROUTE
        element: <RepairsPage />
      },
    ]
  }
]);
/**
 * This is the main entry point of your React application.
 */
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-react-electron-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);