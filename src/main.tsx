import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/smooth-scroll.css';
import { redirectNativeOAuthCallbackFromWeb } from './utils/nativeOAuth';

if (!redirectNativeOAuthCallbackFromWeb()) {
  const root = createRoot(document.getElementById("root")!);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}