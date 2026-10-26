import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Global styles first, so component styles imported by the screens can override them.
import './ui/styles/fonts';
import './ui/styles/tokens.css';
import './ui/styles/global.css';
import './ui/styles/app.css';
import { App } from './ui/App';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
