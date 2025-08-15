



// In src/renderer/src/main.tsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'

import './assets/index.css' 
import App from "./App";
import DashboardPage from './pages/DashboardPage'
import ClientsPage from './pages/ClientsPage'
import HistoryPage from './pages/HistoryPage' // <-- IMPORT THE NEW PAGE

// The router configuration now includes a path for 'history'
const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      {
        path: 'clients',
        element: <ClientsPage />
      },
      { // --- ADD THIS NEW ROUTE OBJECT ---
        path: 'history',
        element: <HistoryPage />
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)


