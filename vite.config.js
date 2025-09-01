import { defineConfig } from 'vite';

export default defineConfig({
  base: '/unity-door-configurator/', // important for GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  optimizeDeps: {
    include: ['three', 'three/examples/jsm/controls/OrbitControls.js'],
  },
  server: {
    port: 3000,
  },
});
