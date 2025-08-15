// In src/renderer/src/components/Layout.tsx
import { Outlet } from 'react-router-dom' // Import Outlet
import Sidebar from './Sidebar'

// In src/renderer/src/components/Layout.tsx



/**
 * The Layout component defines the main visual structure of the application.
 * It uses flexbox to create a sidebar and a main content area.
 */
function Layout(): JSX.Element {
  return (
    // The root div uses 'flex' to arrange its children (Sidebar and main) side-by-side.
    // 'min-h-screen' ensures it always takes up at least the full height of the screen.
    <div className="flex min-h-screen bg-gray-100 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
      
      {/* The Sidebar component */}
      <Sidebar />

      {/* 
        The main content area. This is the crucial part.
        - 'flex-1': This tells the element to "grow" and take up all available free space. This is what makes it "fuller".
        - 'p-8': This adds some internal padding so content doesn't touch the edges.
        - There is NO 'container' or 'mx-auto' class here.
      */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;