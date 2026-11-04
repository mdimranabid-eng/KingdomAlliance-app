import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

// @ts-ignore
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    root: __dirname,
    plugins: [react(), tailwindcss(), basicSsl()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        // Zero-Firebase compatibility layer → 100% Hostinger Node/MySQL backend (see src/lib/fbc/)
        'firebase/app': path.resolve(__dirname, 'src/lib/fbc/app.ts'),
        'firebase/app-check': path.resolve(__dirname, 'src/lib/fbc/app.ts'),
        'firebase/messaging': path.resolve(__dirname, 'src/lib/fbc/messaging.ts'),
        'firebase/firestore': path.resolve(__dirname, 'src/lib/fbc/firestore.ts'),
        'firebase/auth': path.resolve(__dirname, 'src/lib/fbc/auth.ts'),
        'firebase/storage': path.resolve(__dirname, 'src/lib/fbc/storage.ts'),
        'firebase/database': path.resolve(__dirname, 'src/lib/fbc/database.ts'),
        'firebase/functions': path.resolve(__dirname, 'src/lib/fbc/functions.ts'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('lucide-react')) {
                return 'lucide-react';
              }
              if (id.includes('jspdf')) {
                return 'jspdf';
              }
              if (id.includes('@google/genai')) {
                return 'genai';
              }
              if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) {
                return 'react-core';
              }
              if (id.includes('motion')) {
                return 'motion';
              }
              return 'vendor';
            }
          }
        }
      }
    },
    server: {
      // @ts-ignore
      https: true,
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false
        }
      }
    },
  };
});
