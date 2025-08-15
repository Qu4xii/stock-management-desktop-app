// In src/renderer/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import './assets/index.css'; 
import { ThemeProvider } from './components/ThemeProvider';
import App from './App'; 
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage'; // <-- THIS LINE IS NOW CORRECT
import HistoryPage from './pages/HistoryPage';
import ProductsPage from './pages/ProductsPage'; 
const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: 'clients',
        element: <ClientsPage /> // <-- THIS LINE IS NOW CORRECT
      },
      { path: 'history', element: <HistoryPage /> }
    ]
  },

  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'clients', element: <ClientsPage /> },
      {
        path: 'products', // <-- ADD THIS NEW ROUTE OBJECT
        element: <ProductsPage />
      },
      { path: 'history', element: <HistoryPage /> }
    ]
  }

]);


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-react-electron-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);