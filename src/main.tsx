import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { loadWooCatalog } from './lib/woocommerce';

// Charge le catalogue WooCommerce (si VITE_WOO_URL est défini) avant le premier rendu,
// pour que toutes les pages lisent les prix et stocks réels.
loadWooCatalog().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
