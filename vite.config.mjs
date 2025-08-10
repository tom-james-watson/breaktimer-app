import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  root: "./app/renderer",
  base: "./",
  build: {
    outDir: "../../dist/renderer",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "./app/renderer",
      ),
    },
  },
  server: {
    port: 1212,
    host: "localhost",
  },
});
