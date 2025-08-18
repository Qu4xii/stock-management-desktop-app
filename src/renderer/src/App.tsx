// In src/renderer/src/components/App.tsx
import Layout from './components/Layout'
import { Toaster } from 'sonner';
// In src/renderer/src/components/App.tsx


/**
 * The root App component. Its ONLY job is to set the dark theme
 * and render the main Layout component. It should not have any
 * padding or container classes.
 */
function App(): JSX.Element {
  return (
    <main className="dark">
      
      <Layout />
      {/* 2. ADD THE TOASTER COMPONENT HERE */}
      {/* It will be invisible until a toast is triggered. */}
      {/* The 'richColors' prop gives us nice default styling for success/error. */}
      <Toaster richColors />
    </main>
  );
}

export default App;