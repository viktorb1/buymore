import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

import { fileURLToPath, URL } from "node:url";

const currentModuleDirectory = fileURLToPath(new URL('.', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),   crx({ manifest })],
  resolve: {
    alias: {
      '@': currentModuleDirectory + '/src',
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: currentModuleDirectory + '/src/web/popup.html',
        settings: currentModuleDirectory + '/src/web/settings.html',
      }
    }
  },
})
