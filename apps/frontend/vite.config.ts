import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  resolve: {
    alias: {
      '@scoreboard/core': fileURLToPath(new URL('../../packages/core/src', import.meta.url)),
    },
  },
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
    passWithNoTests: true,
  },
})
