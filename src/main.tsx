import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { DBService } from './services/db/db.service'
import { ErrorBoundary } from './components/ErrorBoundary'

async function start() {
  // Dev only: restore IndexedDB from the SQLite mirror *before* the app reads it,
  // otherwise the first load races the restore. Resolves immediately in production.
  await DBService.syncFromMirror().catch((e) => console.warn('Mirror restore skipped:', e))

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary label="ITROPA">
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
}

void start()
