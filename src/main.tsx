import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeAIAssistant } from './services/ai-assistant.service'
import { DBService } from './services/db/db.service'

// Initialize AI Assistant (no API key needed, uses backend)
initializeAIAssistant();

// Restore IndexedDB from local SQLite mirror (dev only, no-op in production)
DBService.syncFromMirror().catch(() => {});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
