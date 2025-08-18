// In src/renderer/src/components/Layout.tsx

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { ModeToggle } from './ModeToggle';

/**
 * The Layout component defines the main visual structure of the application.
 * It creates the fixed sidebar on the left and the main content area on the right.
 */
function Layout(): JSX.Element { // <-- FIX: Corrected JSX.Element type
  return (
    // The root div establishes the flexbox layout and ensures it's at least as tall as the screen.
    <div className="flex min-h-screen">
      
      {/* The Sidebar, which has a fixed width. */}
      <Sidebar />
      
      {/* This container holds the header and the main content, stacking them vertically.
          'flex-1' makes this container take up all remaining horizontal space. */}
      <div className="flex-1 flex flex-col">
        
        {/* A header bar for the top of the content area.
            'flex-shrink-0' prevents this header from shrinking if content is large. */}
        <header className="flex justify-end items-center p-4 border-b dark:border-slate-700 flex-shrink-0">
          <ModeToggle />
        </header>

        {/* 
          This is the main content area where pages are rendered via the <Outlet />.
          - 'flex-1': Makes it grow to fill the available vertical space below the header.
          - 'p-8': Adds comfortable padding inside.
          - 'overflow-y-auto': This is the key improvement. It adds a vertical scrollbar 
            ONLY to this element, and only when the content is too tall to fit.
        */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

export default Layout;