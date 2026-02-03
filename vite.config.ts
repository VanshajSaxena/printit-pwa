/// <reference types="vitest" />

import tailwindcss from "@tailwindcss/vite";
import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import pkg from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    legacy(),
    tailwindcss({ optimize: { minify: true } }),
    VitePWA({
      registerType: "prompt",
      // Caching strategies
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
      manifest: {
        name: "Printly",
        short_name: "Printly",
        description: "Print, Instantly. Anywhere.",
        theme_color: "#4782eb",
        background_color: "#ffffff",
        orientation: "portrait",
        categories: ["productivity", "education"],
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
  resolve: {
    alias: {
      "@api": path.resolve(__dirname, "./src/api"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@context": path.resolve(__dirname, "./src/context"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@layout": path.resolve(__dirname, "./src/layout"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@utils": path.resolve(__dirname, "./src/utils"),
    },
  },
});
