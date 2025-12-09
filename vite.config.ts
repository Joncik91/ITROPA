import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-docs',
      closeBundle() {
        const docsDir = resolve(__dirname, 'dist/docs')
        mkdirSync(docsDir, { recursive: true })
        copyFileSync(
          resolve(__dirname, 'docs/index.html'),
          resolve(docsDir, 'index.html')
        )
      }
    }
  ],
})
