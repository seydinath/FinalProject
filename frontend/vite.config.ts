import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',
    }
  },
  build: {
    // Optimize code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-redux'],
          'redux-vendor': ['@reduxjs/toolkit', 'redux-persist'],
          'three-vendor': ['three'],
          // Page chunks - each page gets its own chunk
          'page-landing': ['./src/pages/LandingPage.tsx'],
          'page-auth': ['./src/pages/AuthPage.tsx'],
          'page-dashboard': ['./src/pages/DashboardPage.tsx'],
          'page-talent-search': ['./src/pages/TalentSearchPage.tsx'],
          'page-profile': ['./src/pages/JobSeekerProfilePage.tsx'],
          // Component chunks
          'components-ui': ['./src/components/TopNav.tsx', './src/components/ToastContainer.tsx', './src/components/Loading.tsx'],
        }
      },
      // Prevent import cycles
      external: [],
    },
    // Target modern browsers for smaller bundle
    target: 'ES2020',
    // Chunk size warnings
    chunkSizeWarningLimit: 500,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Source maps for production debugging
    sourcemap: false,
    // CSS code splitting
    cssCodeSplit: true,
  }
})
