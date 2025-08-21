import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/smooth-scroll.css'

const root = createRoot(document.getElementById("root")!);
root.render(<App />);