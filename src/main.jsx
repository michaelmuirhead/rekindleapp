import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Register service worker for PWA auto-updates
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      // Check for updates every 5 minutes
      setInterval(() => reg.update(), 5 * 60 * 1000);

      reg.addEventListener('updatefound', () => {
        const newSW = reg.installing;
        if (newSW) {
          newSW.addEventListener('statechange', () => {
            if (newSW.state === 'activated' && navigator.serviceWorker.controller) {
              // New version available - show update banner
              const banner = document.createElement('div');
              banner.id = 'update-banner';
              banner.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#f97316;color:#fff;padding:12px 20px;border-radius:12px;font-size:14px;font-weight:600;z-index:9999;display:flex;align-items:center;gap:10px;box-shadow:0 4px 20px rgba(0,0,0,0.3);';
              banner.innerHTML = 'New update available! <button onclick="window.location.reload()" style="background:#fff;color:#f97316;border:none;padding:6px 14px;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px;">Refresh</button>';
              document.body.appendChild(banner);
            }
          });
        }
      });
    });
  });
}
