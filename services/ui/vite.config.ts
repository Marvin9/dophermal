import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {TanStackRouterVite} from '@tanstack/router-vite-plugin';
import tsconfigPaths from 'vite-tsconfig-paths';

const PORT = 3000;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), react(), TanStackRouterVite()],
  server: {
    port: PORT,
  },
});
