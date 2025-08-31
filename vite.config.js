import { defineConfig } from 'vite';

export default defineConfig({
  base: '/unity-door-configurator/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: './index.html',
     
      external: [],
      output: {
        format: 'es',
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    commonjsOptions: {
      include: [/three/, /node_modules/]
    }
  },
  optimizeDeps: {
    include: ['three', 'three/examples/jsm/controls/OrbitControls.js']
  },
  server: {
    port: 3000
  }
});
