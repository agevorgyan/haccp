import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';

/**
 * Entry point for the HACCP PWA Application.
 * Mounts the root React component tree into index.html DOM root element.
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find root element in DOM. Check index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
