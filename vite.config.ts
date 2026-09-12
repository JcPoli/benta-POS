import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Tailwind runs through PostCSS (postcss.config.js + tailwind.config.js),
// which keeps the whole toolchain pure JavaScript — no native binaries, so
// it installs cleanly on Node 18 as well as current LTS.
//
// For GitHub Pages, build with:  npx vite build --base=/<repo-name>/
// Vercel needs no base config.
export default defineConfig({
  plugins: [react()],
});
