import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const topTrumpsMissionRoot = path.resolve(projectRoot, "..", "..", "toptrumps-mission");

export default defineConfig({
  base: "/Office-of-Education-program/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "Office of Education Program",
        short_name: "OEP",
        description: "교육 오피스 탐험 프로그램",
        theme_color: "#0d1b2e",
        background_color: "#0d1b2e",
        display: "standalone",
        scope: "/Office-of-Education-program/",
        start_url: "/Office-of-Education-program/",
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
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
    fs: {
      allow: [projectRoot, topTrumpsMissionRoot],
    },
  },
});
