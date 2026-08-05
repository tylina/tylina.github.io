import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, "index.html"),
        demo: resolve(import.meta.dirname, "demo/index.html"),
        download: resolve(import.meta.dirname, "download/index.html"),
        acp: resolve(import.meta.dirname, "docs/acp/index.html"),
        notFound: resolve(import.meta.dirname, "404.html")
      }
    }
  }
});
