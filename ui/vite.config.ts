import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3732,
    strictPort: true,
    proxy: {
      "/health": { target: "http://localhost:3731", changeOrigin: true },
      "/status": { target: "http://localhost:3731", changeOrigin: true },
      "/v1": { target: "http://localhost:3731", changeOrigin: true },
    },
  },
});
