// In src/renderer/src/components/Layout.tsx

import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { UserNav } from './UserNav';
/**
 * The Layout component defines the main visual structure of the application.
 * It creates the fixed sidebar on the left and the main content area on the right.
 */
function Layout(): JSX.Element {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* --- UPDATE THE HEADER --- */}
        <header className="flex justify-end items-center p-4 border-b border-border flex-shrink-0">
          {/* Replace ModeToggle with UserNav */}
          <UserNav /> 
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;