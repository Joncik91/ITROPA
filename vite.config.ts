import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { resolve } from 'path'
import { sqliteMirrorPlugin } from './vite-plugin-sqlite-mirror'

export default defineConfig({
  plugins: [
    react(),
    sqliteMirrorPlugin(),
    {
      name: 'copy-docs',
      closeBundle() {
        const docsSource = resolve(__dirname, 'docs/index.html')
        // Only copy if source file exists
        if (existsSync(docsSource)) {
          const docsDir = resolve(__dirname, 'dist/docs')
          mkdirSync(docsDir, { recursive: true })
          copyFileSync(docsSource, resolve(docsDir, 'index.html'))
        }
      }
    }
  ],
})
