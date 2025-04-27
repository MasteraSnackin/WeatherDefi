import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Create a root for the React application
// This uses the new React 18 createRoot API
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Render the App component inside React.StrictMode
// StrictMode helps identify potential problems in the application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
