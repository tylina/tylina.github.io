import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import { renderSiteHeader } from "./src/site-header.js";

const stable = JSON.parse(readFileSync(new URL("./public/updates/stable.json", import.meta.url), "utf8"));
const web = JSON.parse(readFileSync(new URL("./web-app.json", import.meta.url), "utf8"));

export default defineConfig({
  plugins: [{
    name: "shared-site-header",
    transformIndexHtml: {
      order: "pre",
      handler: (html, context) => html
        .replace("<!-- tylina:site-header -->", renderSiteHeader(context.path))
        .replaceAll("{{TYLINA_VERSION}}", stable.version)
        .replaceAll("{{TYLINA_WEB_VERSION}}", web.version),
    },
  }],
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
