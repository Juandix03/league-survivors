import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Demo pública: solo el juego (previews de pipeline quedan para `npm run dev` con entradas extra en dev si hace falta).
      input: {
        main: path.resolve(rootDir, 'index.html'),
      },
    },
  },
})
