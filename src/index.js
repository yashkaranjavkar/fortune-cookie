import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './tokens.css';
import './wisecrack-components.css';
import App from './App';
import { MascotProvider } from './components/mascot';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MascotProvider position="bottom">
      <App />
    </MascotProvider>
  </React.StrictMode>
);