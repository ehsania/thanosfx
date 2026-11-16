import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = fileURLToPath(new URL("./demo", import.meta.url));
const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as {
  version: string;
};

export default defineConfig({
  root: "demo",
  base: process.env.VITE_BASE_PATH || "/",
  publicDir: "public",
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: [
      {
        find: /^thanosfx\/react$/,
        replacement: fileURLToPath(new URL("./src/react.tsx", import.meta.url)),
      },
      {
        find: /^thanosfx$/,
        replacement: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      },
    ],
  },
  build: {
    outDir: "../dist-demo",
    emptyOutDir: true,
    target: "es2020",
    rollupOptions: {
      input: resolve(root, "index.html"),
    },
  },
  server: {
    port: 5173,
  },
});
