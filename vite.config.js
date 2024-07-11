import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {},
      },
    },
  },
  publicDir: 'public', // Ensure this points to the directory containing your static assets
});
