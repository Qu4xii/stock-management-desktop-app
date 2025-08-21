// In src/renderer/src/components/Sidebar.tsx

import { Link, useLocation } from 'react-router-dom'
import { Home, Users, Package, Wrench, History, Clipboard } from 'lucide-react'

/**
 * The Sidebar component provides the main navigation for the application.
 * It now uses semantic colors to adapt to the current theme.
 */
function Sidebar(): JSX.Element {
  const location = useLocation()
  const isActive = (path: string): boolean => location.pathname === path

const navLinkClasses = (path: string): string => {
  // The base styles remain the same.
  const baseClasses = 'flex items-center p-2 rounded-md transition-colors duration-100'

  // If the link is active, it gets the primary styles permanently.
  if (isActive(path)) {
    return `${baseClasses} bg-primary text-primary-foreground`
  }

  // If the link is NOT active, it gets the primary styles ONLY on hover.
  return `${baseClasses} hover:bg-primary hover:text-primary-foreground`
}

  return (
    // UPDATED: Replaced hard-coded slate colors with theme-aware classes.
    // 'bg-muted' gives it a distinct background from the main content area.
    <aside className="w-64 bg-muted p-4 flex flex-col flex-shrink-0">
      <div className="mb-8 text-center">
        {/* 'text-foreground' for the main title */}
        <h2 className="text-2xl font-bold text-foreground">Stock and Repair Tracker</h2>
        {/* 'text-muted-foreground' for the secondary text */}
        <p className="text-sm text-muted-foreground">by Mohamed ahmed miled</p>
      </div>
      <nav className="flex flex-col space-y-2">
        {/* Dashboard Link */}
        <Link to="/" className={navLinkClasses('/')}>
          <Home className="w-5 h-5 mr-3" />
          Dashboard
        </Link>

        {/* Clients Link */}
        <Link to="/clients" className={navLinkClasses('/clients')}>
          <Users className="w-5 h-5 mr-3" />
          Clients
        </Link>

        {/* Products Link */}
        {/* --- THIS LINE IS NOW FIXED --- */}
        <Link to="/products" className={navLinkClasses('/products')}>
          <Package className="w-5 h-5 mr-3" />
          Products
        </Link>

        {/* Staff Link */}
        <Link to="/staff" className={navLinkClasses('/staff')}>
          <Clipboard className="w-5 h-5 mr-3" />
          Staff
        </Link>

        {/* History Link */}
        <Link to="/history" className={navLinkClasses('/history')}>
          <History className="w-5 h-5 mr-3" />
          History
        </Link>

        {/* Repairs Link */}
        <Link to="/repairs" className={navLinkClasses('/repairs')}>
          <Wrench className="w-5 h-5 mr-3" />
          Repairs
        </Link>
      </nav>
    </aside>
  )
}

export default Sidebar