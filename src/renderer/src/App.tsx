// In src/renderer/src/App.tsx

import Layout from './components/Layout'
import { Toaster } from 'sonner'
import { ThemeProvider } from './components/ThemeProvider' // Import your existing provider

/**
 * The root App component. Its job is to set up providers like
 * the ThemeProvider and render the main Layout.
 */
function App(): JSX.Element {
  // We wrap the entire app in your ThemeProvider.
  // It will now manage the 'dark', 'light', or system theme.
  return (
    <ThemeProvider defaultTheme="dark" storageKey="stockapp-theme">
      <Layout />
      <Toaster richColors />
    </ThemeProvider>
  )
}

export default App