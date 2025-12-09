import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeAIAssistant } from './services/ai-assistant.service'

// Initialize AI Assistant (no API key needed, uses backend)
initializeAIAssistant();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
