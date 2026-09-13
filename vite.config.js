import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      '__API_BASE_URL__': JSON.stringify(env.API_BASE_URL || ''),
      '__API_KEY__': JSON.stringify(env.API_KEY || '')
    },
    server: {
      port: 3000,
      open: false,
      proxy: {
        '/api': {
          target: env.API_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  };
});
