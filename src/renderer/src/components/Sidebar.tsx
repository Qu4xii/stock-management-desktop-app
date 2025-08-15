// In src/renderer/src/components/Sidebar.tsx

import { Link, useLocation } from 'react-router-dom'
import { Home, Users, Package, Wrench, History } from 'lucide-react'

function Sidebar(): JSX.Element {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 p-4 flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">StockApp</h2>
        <p className="text-sm text-slate-400">by Sousou</p>
      </div>
      <nav className="flex flex-col space-y-2">
        <Link to="/" className={`flex items-center p-2 rounded-md ${isActive('/') ? 'bg-slate-700' : 'hover:bg-slate-700'}`}>
          <Home className="w-5 h-5 mr-3" />
          Dashboard
        </Link>
        <Link to="/clients" className={`flex items-center p-2 rounded-md ${isActive('/clients') ? 'bg-slate-700' : 'hover:bg-slate-700'}`}>
          <Users className="w-5 h-5 mr-3" />
          Clients
        </Link>
        <Link to="/history" className={`flex items-center p-2 rounded-md ${isActive('/history') ? 'bg-slate-700' : 'hover:bg-slate-700'}`}>
          <History className="w-5 h-5 mr-3" />
          History
        </Link>
        {/* Placeholder links for Products and Repairs */}
        <Link to="/products" className={`flex items-center p-2 rounded-md ${isActive('/products') ? 'bg-slate-700' : 'hover:bg-slate-700'}`}>
          <Package className="w-5 h-5 mr-3" />
          Products
        </Link>
        <a href="#" className="flex items-center p-2 rounded-md hover:bg-slate-700 opacity-50 cursor-not-allowed">
          <Wrench className="w-5 h-5 mr-3" />
          Repairs
        </a>
      </nav>
    </aside>
  )
}

export default Sidebar