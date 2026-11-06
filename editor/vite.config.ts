import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Builds the live editor to ../assets/editor. Run after bumping shuttle-editor.
export default defineConfig({
  plugins: [react()],
  base: './',
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    outDir: '../assets/editor',
    emptyOutDir: true,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      input: 'src/main.tsx',
      preserveEntrySignatures: 'exports-only',
      output: {
        entryFileNames: 'editor.js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: (asset) => (asset.names?.[0]?.endsWith('.css') ? 'editor.css' : 'fonts/[name][extname]'),
      },
    },
  },
});
