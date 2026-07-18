import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, "index.html"),
        download: resolve(import.meta.dirname, "download/index.html"),
        privacy: resolve(import.meta.dirname, "privacy/index.html"),
        notFound: resolve(import.meta.dirname, "404.html")
      }
    }
  }
});
