// File: src/renderer/src/components/Sidebar.tsx

import { Link, useLocation } from 'react-router-dom'
import { Home, Users, Package, Wrench, History, Clipboard, LogOut, Truck, ShoppingCart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
// [PERMISSIONS] Step 1: Import our new usePermissions hook
import { usePermissions } from '../hooks/usePermissions'

/**
 * The Sidebar component provides the main navigation for the application.
 * It now dynamically renders links based on the current user's role.
 */
function Sidebar(): JSX.Element {
  const location = useLocation()
  const { logOut } = useAuth()
  // [PERMISSIONS] Step 2: Get the 'can' function from the hook
  const { can } = usePermissions()

  const isActive = (path: string): boolean => location.pathname === path

  const navLinkClasses = (path: string): string => {
    const baseClasses = 'flex items-center p-2 rounded-md transition-colors duration-100'
    if (isActive(path)) {
      return `${baseClasses} bg-primary text-primary-foreground`
    }
    return `${baseClasses} hover:bg-primary hover:text-primary-foreground`
  }

  return (
    <aside className="w-64 bg-muted p-4 flex flex-col flex-shrink-0">
      <div>
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-foreground">Invento</h2>
          <p className="text-sm text-muted-foreground">Stock and Repair Tracker</p>
        </div>
        <nav className="flex flex-col space-y-2">
          {/* [PERMISSIONS] Step 3: Wrap each link in a permission check */}

          {/* Dashboard is visible to most roles */}
          {(can('dashboard:read-all') || can('dashboard:read-limited')) && (
            <Link to="/" className={navLinkClasses('/')}>
              <Home className="w-5 h-5 mr-3" />
              Dashboard
            </Link>
          )}

          {/* Clients is visible to Manager, Cashier, and Technician (read-only) */}
          {can('clients:read') && (
            <Link to="/clients" className={navLinkClasses('/clients')}>
              <Users className="w-5 h-5 mr-3" />
              Clients
            </Link>
          )}
          {/* Staff is visible to Manager, Cashier, and Technician (self-only) */}
          {(can('staff:read') || can('staff:read-self')) && (
            <Link to="/staff" className={navLinkClasses('/staff')}>
              <Clipboard className="w-5 h-5 mr-3" />
              Staff
            </Link>
          )}
                    {/* Repairs is visible to Manager, Cashier, and Technician */}
          {(can('repairs:read') || can('repairs:read-assigned')) && (
            <Link to="/repairs" className={navLinkClasses('/repairs')}>
              <Wrench className="w-5 h-5 mr-3" />
              Repairs
            </Link>
          )}
          {/* Suppliers is visible to Manager and Inventory Associate */}
          {can('suppliers:read') && (
            <Link to="/suppliers" className={navLinkClasses('/suppliers')}>
              <Truck className="w-5 h-5 mr-3" />
              Suppliers
            </Link>
          )}
                    {/* Products is visible to almost everyone for viewing */}
          {can('products:read') && (
            <Link to="/products" className={navLinkClasses('/products')}>
              <Package className="w-5 h-5 mr-3" />
              Products
            </Link>
          )}
          {can('purchase-orders:read') && (
            <Link to="/purchase-orders" className={navLinkClasses('/purchase-orders')}>
              <ShoppingCart className="h-5 h-5 mr-3" />
              Purchase Orders
            </Link>
          )}
          {/* History is only visible to Manager and Cashier */}
          {can('history:read') && (
            <Link to="/history" className={navLinkClasses('/history')}>
              <History className="w-5 h-5 mr-3" />
              History
            </Link>
          )}

        </nav>
      </div>

      <div className="mt-auto">
        <button
          onClick={logOut}
          className="flex items-center p-2 rounded-md transition-colors duration-100 w-full text-left hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar