import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// When deploying to https://<user>.github.io/<repo>/, set base to "/<repo>/".
// For root-domain deployments (CNAME), leave as "/".
const base = process.env.GH_PAGES_BASE ?? '/';

export default defineConfig({
  plugins: [react()],
  base,
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
