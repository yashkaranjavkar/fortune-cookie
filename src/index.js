import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './tokens.css';
import './wisecrack-components.css';
import App from './App';
import { MascotProvider } from './components/mascot';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { isDashboardRoute } from './analytics/route';

// http://localhost:3000/#analytics opens the Analytics page instead of the game.
// Switching between the two (the 📊 button, or editing the URL) reloads the page so
// each one starts clean.
window.addEventListener('hashchange', () => window.location.reload());

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {isDashboardRoute() ? (
      <AnalyticsDashboard />
    ) : (
      <MascotProvider position="bottom">
        <App />
      </MascotProvider>
    )}
  </React.StrictMode>
);