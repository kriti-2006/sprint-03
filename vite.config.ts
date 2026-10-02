import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
// Relative base ("./") keeps asset URLs correct on Vercel and any static
// host, regardless of the deploy subpath.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    target: "es2020",
    sourcemap: false,
  },
});
