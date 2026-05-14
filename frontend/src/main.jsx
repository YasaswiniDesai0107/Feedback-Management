/**
 * src/main.jsx
 * -------------
 * The JavaScript entry point.
 * Mounts the React application into the <div id="root"> in index.html.
 *
 * React.StrictMode wraps the app to:
 *   - Detect potential problems in development
 *   - Warn about deprecated APIs
 *   - Does NOT affect the production build
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Import global styles (Tailwind + custom CSS)
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
