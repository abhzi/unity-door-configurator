import { defineConfig } from 'vite';

export default defineConfig({
  base: '/unity-door-configurator/', // Correct GitHub Pages base path
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: './index.html'
    }
  },
  server: {
    port: 3000
  }
});
