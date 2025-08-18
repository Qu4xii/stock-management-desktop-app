// In src/renderer/src/components/Sidebar.tsx

import { Link, useLocation } from 'react-router-dom';
// --- 1. IMPORT THE CORRECT ICON NAME ---
// We change 'ClipboardUser' to 'ClipboardUserIcon' as suggested by the error.
import { Home, Users, Package, Wrench, History, Clipboard } from 'lucide-react';

/**
 * The Sidebar component provides the main navigation for the application.
 */
function Sidebar(): JSX.Element {
  const location = useLocation();
  const isActive = (path: string): boolean => location.pathname === path;

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 p-4 flex flex-col flex-shrink-0">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold">StockApp</h2>
        <p className="text-sm text-slate-400">by Sousou</p>
      </div>
      <nav className="flex flex-col space-y-2">
        {/* Dashboard Link */}
        <Link
          to="/"
          className={`flex items-center p-2 rounded-md transition-colors ${
            isActive('/') ? 'bg-slate-700' : 'hover:bg-slate-700'
          }`}
        >
          <Home className="w-5 h-5 mr-3" />
          Dashboard
        </Link>
        
        {/* Clients Link */}
        <Link
          to="/clients"
          className={`flex items-center p-2 rounded-md transition-colors ${
            isActive('/clients') ? 'bg-slate-700' : 'hover:bg-slate-700'
          }`}
        >
          <Users className="w-5 h-5 mr-3" />
          Clients
        </Link>
        
        {/* Products Link */}
        <Link
          to="/products"
          className={`flex items-center p-2 rounded-md transition-colors ${
            isActive('/products') ? 'bg-slate-700' : 'hover:bg-slate-700'
          }`}
        >
          <Package className="w-5 h-5 mr-3" />
          Products
        </Link>
        
        {/* Staff Link */}
        <Link
          to="/staff"
          className={`flex items-center p-2 rounded-md transition-colors ${
            isActive('/staff') ? 'bg-slate-700' : 'hover:bg-slate-700'
          }`}
        >
          {/* --- 2. USE THE CORRECT COMPONENT NAME HERE --- */}
          <Clipboard className="w-5 h-5 mr-3" />
          Staff
        </Link>
        
        {/* History Link */}
        <Link
          to="/history"
          className={`flex items-center p-2 rounded-md transition-colors ${
            isActive('/history') ? 'bg-slate-700' : 'hover:bg-slate-700'
          }`}
        >
          <History className="w-5 h-5 mr-3" />
          History
        </Link>

        {/* Repairs Link (placeholder) */}
        <a href="#" className="flex items-center p-2 rounded-md opacity-50 cursor-not-allowed">
          <Wrench className="w-5 h-5 mr-3" />
          Repairs
        </a>
      </nav>
    </aside>
  );
}

export default Sidebar;