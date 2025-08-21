// In src/renderer/src/components/Sidebar.tsx

import { Link, useLocation } from 'react-router-dom'
// --- 1. IMPORT THE LogOut ICON AND useAuth HOOK ---
import { Home, Users, Package, Wrench, History, Clipboard, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext' // Adjust path if needed

/**
 * The Sidebar component provides the main navigation for the application.
 */
function Sidebar(): JSX.Element {
  const location = useLocation()
  // --- 2. GET THE logOut FUNCTION FROM THE AUTH CONTEXT ---
  const { logOut } = useAuth()

  const isActive = (path: string): boolean => location.pathname === path

  const navLinkClasses = (path: string): string => {
    const baseClasses = 'flex items-center p-2 rounded-md transition-colors duration-100'
    if (isActive(path)) {
      return `${baseClasses} bg-primary text-primary-foreground`
    }
    return `${baseClasses} hover:bg-primary hover:text-primary-foreground`
  }

  return (
    // The main container is a flex column, which is perfect for this.
    <aside className="w-64 bg-muted p-4 flex flex-col flex-shrink-0">
      <div>
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-foreground">Stock and Repair Tracker</h2>
          <p className="text-sm text-muted-foreground">by Mohamed ahmed miled</p>
        </div>
        <nav className="flex flex-col space-y-2">
          {/* Dashboard Link */}
          <Link to="/" className={navLinkClasses('/')}>
            <Home className="w-5 h-5 mr-3" />
            Dashboard
          </Link>

          {/* ... other links ... */}
          <Link to="/clients" className={navLinkClasses('/clients')}>
            <Users className="w-5 h-5 mr-3" />
            Clients
          </Link>
          <Link to="/products" className={navLinkClasses('/products')}>
            <Package className="w-5 h-5 mr-3" />
            Products
          </Link>
          <Link to="/staff" className={navLinkClasses('/staff')}>
            <Clipboard className="w-5 h-5 mr-3" />
            Staff
          </Link>
          <Link to="/history" className={navLinkClasses('/history')}>
            <History className="w-5 h-5 mr-3" />
            History
          </Link>
          <Link to="/repairs" className={navLinkClasses('/repairs')}>
            <Wrench className="w-5 h-5 mr-3" />
            Repairs
          </Link>
        </nav>
      </div>

      {/* --- 3. ADD THE LOGOUT BUTTON --- */}
      {/* 'mt-auto' pushes this div to the bottom of the flex container */}
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