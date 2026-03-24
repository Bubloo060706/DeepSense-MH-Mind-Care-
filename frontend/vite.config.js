import { defineConfig } from "vite";
import react            from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    proxy: {
      // Proxy API calls to Flask backend during development
      "/api": {
        target:       "http://localhost:5000",
        changeOrigin: true,
        secure:       false,
      },
    },
  },

  build: {
    outDir:     "dist",
    sourcemap:  true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:   ["react", "react-dom", "react-router-dom"],
          charts:   ["recharts"],
        },
      },
    },
  },

  resolve: {
    alias: {
      "@": "/src",
    },
  },
});