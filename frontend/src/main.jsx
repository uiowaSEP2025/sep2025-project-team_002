import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import Bugsnag from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';
import BugsnagPerformance from '@bugsnag/browser-performance';

// Initialize Bugsnag
Bugsnag.start({
  apiKey: 'ce859eba59f45518ad9f330a53eea9f8',
  plugins: [new BugsnagPluginReact()]
});
BugsnagPerformance.start({ apiKey: 'ce859eba59f45518ad9f330a53eea9f8' });

// Get the error boundary provided by Bugsnag
const ErrorBoundary = Bugsnag.getPlugin('react').createErrorBoundary(React);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);