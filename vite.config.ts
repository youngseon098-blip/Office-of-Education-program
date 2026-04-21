import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const topTrumpsMissionRoot = path.resolve(projectRoot, "..", "..", "toptrumps-mission");

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    fs: {
      allow: [projectRoot, topTrumpsMissionRoot],
    },
  },
});
