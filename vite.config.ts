import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Served from https://rcmarron.github.io/Winnemac-tour/, so assets need the
  // repository name as their base path.
  base: '/Winnemac-tour/',
  server: {
    host: true,
  },
})
