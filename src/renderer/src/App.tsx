// In src/renderer/src/components/App.tsx
import Layout from './components/Layout'

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
    </main>
  );
}

export default App;