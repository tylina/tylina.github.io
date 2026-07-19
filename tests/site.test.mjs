import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const dist = new URL("../dist/", import.meta.url);
const built = (path) => readFile(new URL(path, dist), "utf8");

test("builds every public route with bilingual product copy", async () => {
  const [home, download, privacy, notFound] = await Promise.all([
    built("index.html"), built("download/index.html"), built("privacy/index.html"), built("404.html")
  ]);
  assert.match(home, /像写文档一样/);
  assert.match(home, /Write Typst/);
  assert.match(home, /document-first, local-first Typst desktop editor/i);
  assert.match(home, /<html lang="en" data-lang="en">/);
  assert.match(home, /data-language-option="en"/);
  assert.match(home, /data-language-option="zh"/);
  assert.ok(home.indexOf('class="mode-name">Source') < home.indexOf('class="mode-name">Preview'));
  assert.match(download, /SHA256SUMS\.txt/);
  assert.match(privacy, /does not upload your documents/i);
  assert.match(notFound, /404/);
});

test("publishes the official brand assets and site metadata", async () => {
  await Promise.all(["app.svg", "app.png", "favicon.svg", "robots.txt", "sitemap.xml", "site.webmanifest", ".nojekyll"].map((path) => access(new URL(path, dist))));
  const home = await built("index.html");
  assert.match(home, /<img src="\/app\.png" alt="">/);
});

test("does not claim that the proprietary desktop source is public", async () => {
  const home = await built("index.html");
  assert.doesNotMatch(home, /github\.com\/(?:OrangeX4|tylina)\/tylina(?:[\"'/]|$)/i);
  assert.doesNotMatch(home, /open[ -]?source/i);
  assert.match(home, /github\.com\/tylina\/tylina-issues/);
});
