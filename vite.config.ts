import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Dev-only middleware so the AI proxy (/api/ai) also works in `npm run dev`.
 * In production the same handler is served by Vercel as a serverless function.
 */
function aiProxyDevPlugin(): Plugin {
  return {
    name: 'ai-proxy-dev',
    configureServer(server) {
      server.middlewares.use('/api/ai', async (req, res) => {
        try {
          const { default: handler } = await import('./api/ai.mjs');
          handler(req, res);
        } catch (err) {
          console.error('[ai-proxy] Dev proxy error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'AI proxy error' }));
        }
      });
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');

  // Server-side only env for the dev AI proxy (never exposed to the client).
  process.env.BASE44_APP_ID = process.env.BASE44_APP_ID || env.BASE44_APP_ID || '';
  process.env.BASE44_API_KEY = process.env.BASE44_API_KEY || env.BASE44_API_KEY || '';
  process.env.ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || env.ALLOWED_ORIGINS || '';

  return {
    base: '/',
    plugins: [
      react(),
      tailwindcss(),
      aiProxyDevPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'Bac Tracker',
          short_name: 'BacTracker',
          description: 'L\'excellence au Bac algérien',
          theme_color: '#4f46e5',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              src: 'icons/icon-192.webp',
              sizes: '192x192',
              type: 'image/webp'
            },
            {
              src: 'icons/icon-512.webp',
              sizes: '512x512',
              type: 'image/webp'
            },
            {
              src: 'icons/icon-512.webp',
              sizes: '512x512',
              type: 'image/webp',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            'vendor-ui': ['lucide-react', 'motion', 'recharts']
          }
        }
      }
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
