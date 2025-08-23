// File: src/renderer/src/pages/DashboardPage.tsx

import React from 'react'
import { usePermissions } from '../hooks/usePermissions'
import ManagerDashboard from '../components/dashboards/ManagerDashboard'
import TechnicianDashboard from '../components/dashboards/TechnicianDashboard'
import InventoryDashboard from '../components/dashboards/InventoryDashboard'
import DefaultDashboard from '../components/dashboards/DefaultDashboard'
import { Loader2 } from 'lucide-react'

function DashboardPage(): JSX.Element {
  const { role,currentUser: user } = usePermissions()

  if (!role || !user) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // This acts as a router, rendering the correct dashboard based on the user's role.
  const renderDashboardByRole = () => {
    switch (role) {
      // --- THIS IS THE ONLY CHANGE ---
      // If the role is Manager OR Cashier, show the full ManagerDashboard.
      case 'Manager':
      case 'Cashier':
        return <ManagerDashboard user={user} />
      // --- END OF CHANGE ---

      case 'Technician':
        return <TechnicianDashboard user={user} />
      case 'Inventory Associate':
        return <InventoryDashboard user={user} />
      
      // For any other role, show a default welcome screen.
      default:
        return <DefaultDashboard user={user} />
    }
  }

  return (
    <div className="flex h-full flex-1 flex-col space-y-8 p-8">

      {renderDashboardByRole()}
    </div>
  )
}

export default DashboardPage