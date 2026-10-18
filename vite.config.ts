/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { sqliteMirrorPlugin } from './vite-plugin-sqlite-mirror'
import { devApiPlugin } from './vite-plugin-dev-api'

const SERVER_ENV_KEYS = ['GEMINI_API_KEY', 'GEMINI_MODEL', 'APP_PASSWORD'] as const

export default defineConfig(({ mode }) => {
  // Expose server-only secrets from .env to the dev API middleware (never to the client bundle).
  const env = loadEnv(mode, process.cwd(), '')
  for (const key of SERVER_ENV_KEYS) {
    if (env[key] && !process.env[key]) process.env[key] = env[key]
  }

  return {
    plugins: [
      react(),
      devApiPlugin(),
      sqliteMirrorPlugin(),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            vendor: ['framer-motion', 'dexie', 'react-hot-toast'],
          },
        },
      },
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts', 'api/**/*.test.ts'],
    },
  }
})
