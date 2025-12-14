import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import { fileURLToPath } from "url"

// This creates __dirname manually for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],1
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})