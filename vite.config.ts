import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
// Relative base ("./") keeps asset + worker URLs correct on Vercel and any
// static host, regardless of the deploy subpath.
export default defineConfig({
  base: "./",
  plugins: [react()],
  worker: {
    // ES module workers work in modern browsers and are the Vite-recommended
    // format. The worker is imported with `new Worker(new URL(...), { type: "module" })`
    // in useDataProcessor, which Vite bundles and fingerprints for production.
    format: "es",
  },
  build: {
    target: "es2020",
    sourcemap: false,
  },
});
