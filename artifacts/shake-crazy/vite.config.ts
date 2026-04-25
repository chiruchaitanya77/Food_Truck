import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const rawPort = process.env.PORT ?? "5173";
const basePath = process.env.BASE_PATH ?? "/";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

if (typeof basePath !== "string") {
  throw new Error(`Invalid BASE_PATH value: "${basePath}"`);
}

// 👇 ADD THIS (backend URL)
// const BACKEND_URL = process.env.VITE_API_URL ?? "http://localhost:8000";
const BACKEND_URL = process.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export default defineConfig({
  base: basePath,

  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },

  root: path.resolve(__dirname),

  // build: {
  //   outDir: path.resolve(__dirname, "dist/public"),
  //   emptyOutDir: true,
  // },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },

  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,

    // PROXY CONFIG (IMPORTANT)
    proxy: {
      "/api": {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: false,
      },
    },

    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },

  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
