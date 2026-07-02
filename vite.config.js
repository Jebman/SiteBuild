import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        calendar: resolve(__dirname, 'calendar.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        workouts: resolve(__dirname, 'workouts.html'),
        notebook: resolve(__dirname, 'notebook.html'),
      }
    }
  }
})
