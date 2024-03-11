// vite.config.ts
import { defineConfig } from "file:///Users/mayursiinh/Desktop/dophermal/services/ui/node_modules/.pnpm/vite@5.1.5_less@4.2.0/node_modules/vite/dist/node/index.js";
import react from "file:///Users/mayursiinh/Desktop/dophermal/services/ui/node_modules/.pnpm/@vitejs+plugin-react@4.2.1_vite@5.1.5/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { TanStackRouterVite } from "file:///Users/mayursiinh/Desktop/dophermal/services/ui/node_modules/.pnpm/@tanstack+router-vite-plugin@1.19.6/node_modules/@tanstack/router-vite-plugin/dist/esm/index.js";
import tsconfigPaths from "file:///Users/mayursiinh/Desktop/dophermal/services/ui/node_modules/.pnpm/vite-tsconfig-paths@4.3.1_typescript@5.4.2_vite@5.1.5/node_modules/vite-tsconfig-paths/dist/index.mjs";
var PORT = 3e3;
var vite_config_default = defineConfig({
  plugins: [tsconfigPaths(), react(), TanStackRouterVite()],
  server: {
    cors: true,
    port: PORT,
    proxy: {
      "/api": {
        target: "http://localhost:8000/api",
        changeOrigin: true
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvbWF5dXJzaWluaC9EZXNrdG9wL2RvcGhlcm1hbC9zZXJ2aWNlcy91aVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL21heXVyc2lpbmgvRGVza3RvcC9kb3BoZXJtYWwvc2VydmljZXMvdWkvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL21heXVyc2lpbmgvRGVza3RvcC9kb3BoZXJtYWwvc2VydmljZXMvdWkvdml0ZS5jb25maWcudHNcIjtpbXBvcnQge2RlZmluZUNvbmZpZ30gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHtUYW5TdGFja1JvdXRlclZpdGV9IGZyb20gJ0B0YW5zdGFjay9yb3V0ZXItdml0ZS1wbHVnaW4nO1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSAndml0ZS10c2NvbmZpZy1wYXRocyc7XG5cbmNvbnN0IFBPUlQgPSAzMDAwO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3RzY29uZmlnUGF0aHMoKSwgcmVhY3QoKSwgVGFuU3RhY2tSb3V0ZXJWaXRlKCldLFxuICBzZXJ2ZXI6IHtcbiAgICBjb3JzOiB0cnVlLFxuICAgIHBvcnQ6IFBPUlQsXG4gICAgcHJveHk6IHtcbiAgICAgICcvYXBpJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQStULFNBQVEsb0JBQW1CO0FBQzFWLE9BQU8sV0FBVztBQUNsQixTQUFRLDBCQUF5QjtBQUNqQyxPQUFPLG1CQUFtQjtBQUUxQixJQUFNLE9BQU87QUFHYixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsY0FBYyxHQUFHLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQztBQUFBLEVBQ3hELFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
