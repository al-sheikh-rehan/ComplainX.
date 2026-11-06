import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    );
  } catch (err) {
    console.error('Fatal initialization error in main.tsx:', err);
    rootElement.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f172a; color: white; font-family: system-ui, sans-serif; padding: 20px;">
        <div style="max-width: 500px; width: 100%; background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; text-align: center;">
          <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 12px;">ComplainX Citizen Portal</h2>
          <p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">Click below to reload and refresh cache.</p>
          <button onclick="window.location.reload()" style="background: #2563eb; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer;">Reload Application</button>
        </div>
      </div>
    `;
  }
} else {
  console.error('Root element #root not found in document.');
}
