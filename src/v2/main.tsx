import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { ErrorBoundary } from '../components/ErrorBoundary';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary label="ITROPA V2">
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
