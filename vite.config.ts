/// <reference types="vitest" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import pkg from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === "EVAL" && warning.id?.includes("pdfjs-dist")) {
          return;
        }
        warn(warning);
      },
    },
  },
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(pkg.version),
    "import.meta.env.VITE_NETLIFY_CONTEXT": JSON.stringify(
      process.env.CONTEXT ?? "dev",
    ),
    "import.meta.env.VITE_COMMIT_REF": JSON.stringify(
      process.env.COMMIT_REF ?? "local",
    ),
    "import.meta.env.VITE_DEPLOY_PRIME_URL": JSON.stringify(
      process.env.DEPLOY_PRIME_URL ?? "localhost",
    ),
  },
  plugins: [
    react(),
    tailwindcss({ optimize: { minify: true } }),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      registerType: "prompt",
      // Caching strategies
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
      manifest: {
        id: "/",
        name: "Printit",
        short_name: "Printit",
        description: "Print, Instantly. Anywhere.",
        background_color: "#F9F9FA",
        display: "standalone",
        theme_color: "#FFFFFF",
        orientation: "portrait",
        categories: ["productivity", "education"],
        start_url: "./",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],

        screenshots: [
          {
            src: "/screenshots/home.png",
            sizes: "1170x2532",
            type: "image/png",
            form_factor: "narrow",
            label: "Upload PDFs instantly",
          },
          {
            src: "/screenshots/order.png",
            sizes: "1170x2532",
            type: "image/png",
            form_factor: "narrow",
            label: "Track print orders",
          },
          {
            src: "/screenshots/print.png",
            sizes: "1170x2532",
            type: "image/png",
            form_factor: "narrow",
            label: "Configure to Print any page",
          },
          {
            src: "/screenshots/desktop-home.png",
            sizes: "1920x1080",
            type: "image/png",
            form_factor: "wide",
            label: "Desktop experience",
          },
        ],
        share_target: {
          action: "/share-target",
          method: "POST",
          enctype: "multipart/form-data",
          params: {
            title: "title",
            text: "text",
            url: "url",
            files: [
              {
                name: "file",
                accept: ["application/pdf", ".pdf"],
              },
            ],
          },
        },
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
