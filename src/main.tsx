import React from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import App from './App';
import './index.css';
import './styles/smooth-scroll.css';
import { initializeAdMob } from './services/admobService';

// Initialize AdMob on native platforms
if (Capacitor.isNativePlatform()) {
  initializeAdMob().then((success) => {
    console.log('[App] AdMob initialization:', success ? 'success' : 'failed');
  });
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);