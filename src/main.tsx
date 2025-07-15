import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Add error handling for missing root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = '<div style="padding: 20px; font-family: Arial;"><h1>Error: Root element not found</h1><p>The application could not start. Please check the HTML template.</p></div>';
  throw new Error('Root element not found');
}

try {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  console.log('React app rendered successfully');
} catch (error) {
  console.error('Failed to render React app:', error);
  rootElement.innerHTML = '<div style="padding: 20px; font-family: Arial;"><h1>Application Error</h1><p>Failed to start the application. Check console for details.</p><pre>' + String(error) + '</pre></div>';
}
