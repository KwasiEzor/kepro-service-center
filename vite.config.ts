import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import viteCompression from 'vite-plugin-compression';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const isProd = mode === 'production';

  return {
    plugins: [
      react(),
      tailwindcss(),
      // Gzip compression
      isProd && viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
      }),
      // Brotli compression
      isProd && viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
      }),
    ].filter(Boolean),
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@shared': path.resolve(__dirname, './shared'),
      },
    },
    build: {
      // Code splitting and optimization
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Vendor chunks - order matters to avoid circular deps
            if (id.includes('node_modules')) {
              // Core React libs (must be first)
              if (id.includes('/react/') || id.includes('/react-dom/')) {
                return 'react-core';
              }
              // React Router
              if (id.includes('react-router')) {
                return 'react-router';
              }
              // Animation library
              if (id.includes('motion') || id.includes('framer')) {
                return 'motion-vendor';
              }
              // Form libraries
              if (id.includes('react-hook-form') || id.includes('@hookform')) {
                return 'form-vendor';
              }
              // Zod validation
              if (id.includes('zod')) {
                return 'zod-vendor';
              }
              // i18n libraries
              if (id.includes('i18next') || id.includes('i18n')) {
                return 'i18n-vendor';
              }
              // Icons
              if (id.includes('lucide-react')) {
                return 'icons-vendor';
              }
              // Google AI
              if (id.includes('@google/generative-ai')) {
                return 'ai-vendor';
              }
              // Everything else
              return 'vendor';
            }

            // Application code splitting
            if (id.includes('/pages/dashboard/')) {
              return 'dashboard';
            }
            if (id.includes('/pages/auth/')) {
              return 'auth';
            }
            if (id.includes('/components/dashboard/')) {
              return 'dashboard-components';
            }
          },
        },
      },
      // Target smaller chunks
      chunkSizeWarningLimit: 500,
      // Minification
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProd,
          drop_debugger: isProd,
          pure_funcs: isProd ? ['console.log', 'console.info'] : [],
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      // HMR configuration
      hmr: process.env.DISABLE_HMR === 'true' ? false : {
        protocol: 'ws',
        host: 'localhost',
        port: 3000,
      },
    },
  };
});
