import { defineConfig } from 'vite';

export default defineConfig({
  base: '/unity-door-configurator/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000, 
    rollupOptions: {
      input: './index.html',
      output: {
      
        manualChunks: {
          'three': ['three'],
          'vendor': ['three/examples/jsm/controls/OrbitControls.js']
        }
      }
    }
  },
  server: {
    port: 3000
  }
});
