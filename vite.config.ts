import path from "path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
 
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://alive.ineed.asia',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});