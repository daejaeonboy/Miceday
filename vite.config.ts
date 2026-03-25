import fs from 'fs';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const https =
      env.VITE_DEV_SSL_KEY_FILE && env.VITE_DEV_SSL_CERT_FILE
        ? {
            key: fs.readFileSync(path.resolve(__dirname, env.VITE_DEV_SSL_KEY_FILE)),
            cert: fs.readFileSync(path.resolve(__dirname, env.VITE_DEV_SSL_CERT_FILE)),
          }
        : undefined;

    return {
      server: {
        port: 3010,
        host: '0.0.0.0',
        https,
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
