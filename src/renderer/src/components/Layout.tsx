// In src/renderer/src/components/Layout.tsx

import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { ModeToggle } from './ModeToggle' // Assuming this is your ThemeToggle component

function Layout(): JSX.Element {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* 
          UPDATED: Removed 'dark:border-slate-700' and added 'border-border'.
          The 'border-b' class sets the width, and 'border-border' sets the color 
          using the theme variable, making it adapt automatically.
        */}
        <header className="flex justify-end items-center p-4 border-b border-border flex-shrink-0">
          <ModeToggle />
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout