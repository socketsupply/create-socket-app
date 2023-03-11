import React from 'react';
import { createRoot } from 'react-dom/client';
import process from 'socket:process';

if (process.env.DEBUG) {
  console.log('started in debug mode');
}

// components
import App from './App';

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
