import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './tokens.css';
import './wisecrack-components.css';
import './cursors.css';
import App from './App';
import { MascotProvider } from './components/mascot';
import { installPressTilt } from './utils/cursor';

// Cursors tilt a little while the mouse button is down (see src/utils/cursor.js)
installPressTilt();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MascotProvider position="bottom">
      <App />
    </MascotProvider>
  </React.StrictMode>
);