import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const dist = new URL("../dist/", import.meta.url);
const built = (path) => readFile(new URL(path, dist), "utf8");

test("builds every public route with bilingual product copy", async () => {
  const [home, demo, download, acp, notFound] = await Promise.all([
    built("index.html"), built("demo/index.html"), built("download/index.html"),
    built("docs/acp/index.html"), built("404.html")
  ]);
  assert.match(home, /Typst，<br>所见即所得。/);
  assert.match(home, /WYSIWYG<br>for Typst\./);
  assert.match(home, /写作，从排版后的页面开始/);
  assert.match(home, /Write from the typeset page/);
  assert.match(home, /所见即所得/);
  assert.match(home, /WYSIWYG, backed by Typst/);
  assert.match(home, /document-first, local-first Typst desktop editor/i);
  assert.match(home, /<html lang="en" data-lang="en">/);
  assert.match(home, /data-language-option="en"/);
  assert.match(home, /data-language-option="zh"/);
  assert.match(home, /href="\/demo\/">Demo<\/a>/);
  assert.ok(home.indexOf('data-lang-content="en">Source</span>') < home.indexOf('data-lang-content="en">Preview</span>'));
  assert.match(demo, /看看文档优先的编辑体验。/);
  assert.match(demo, /See document-first editing in motion\./);
  assert.match(demo, /<img src="\/demo\.gif" alt="" width="1440" height="824"/);
  assert.match(demo, /href="\/demo\/" aria-current="page">Demo<\/a>/);
  assert.match(download, /href="\/demo\/">Demo<\/a>/);
  assert.match(download, /SHA256SUMS\.txt/);
  const releaseAssets = [
    "Tylina-0.3.0-mac-arm64.dmg",
    "Tylina-0.3.0-mac-arm64.zip",
    "Tylina-0.3.0-mac-x64.dmg",
    "Tylina-0.3.0-mac-x64.zip",
    "Tylina-0.3.0-win-arm64.exe",
    "Tylina-0.3.0-win-x64.exe",
    "Tylina-0.3.0-linux-arm64.AppImage",
    "Tylina-0.3.0-linux-arm64.deb",
    "Tylina-0.3.0-linux-x86_64.AppImage",
    "Tylina-0.3.0-linux-amd64.deb",
    "SHA256SUMS.txt",
  ];
  for (const asset of releaseAssets) {
    assert.match(download, new RegExp(`releases/download/v0\\.3\\.0/${asset.replaceAll(".", "\\.")}`));
  }
  assert.doesNotMatch(home, /0\.1\.0/);
  assert.doesNotMatch(download, /0\.1\.0/);
  assert.match(download, /support\.apple\.com\/guide\/mac-help\/mh40617\/mac/);
  assert.match(download, /System Settings → Privacy &amp; Security/);
  assert.match(download, /系统设置 → 隐私与安全性/);
  assert.doesNotMatch(download, /\.blockmap/);
  assert.doesNotMatch(home, /href="\/privacy\//);
  assert.doesNotMatch(download, /href="\/privacy\//);
  assert.match(acp, /在 Tylina 中连接 ACP Agent/);
  assert.match(acp, /Connect an ACP Agent to Tylina/);
  assert.match(acp, /Tylina never starts an Agent until you explicitly select/);
  assert.match(acp, /executable and each argument separately/);
  assert.match(acp, /agentclientprotocol\.com\/get-started\/registry/);
  assert.match(notFound, /404/);
});

test("publishes the official brand assets and site metadata", async () => {
  await Promise.all(["app.svg", "app.png", "demo.gif", "favicon.png", "THIRD_PARTY_NOTICES.txt", "robots.txt", "sitemap.xml", "site.webmanifest", ".nojekyll"].map((path) => access(new URL(path, dist))));
  const home = await built("index.html");
  assert.match(home, /<img src="\/app\.png" alt="">/);
  assert.match(home, /<link rel="icon" href="\/favicon\.png" type="image\/png" sizes="64x64">/);
  assert.match(home, /data-lucide="globe-2"/);
});

test("publishes a stable update manifest that matches the download page", async () => {
  const manifest = JSON.parse(await built("updates/stable.json"));
  const download = await built("download/index.html");

  assert.deepEqual(manifest, {
    schemaVersion: 1,
    channel: "stable",
    version: "0.3.0",
    downloadUrl: "https://tylina.github.io/download/",
    releaseNotesUrl: "https://github.com/tylina/tylina-issues/releases/tag/v0.3.0",
    highlights: {
      en: [
        "Connect Codex, Claude Code, Kimi Code, OpenCode, or a custom ACP Agent.",
        "Review app updates and resolve external file conflicts without losing either version."
      ],
      "zh-CN": [
        "连接 Codex、Claude Code、Kimi Code、OpenCode 或自定义 ACP Agent。",
        "在应用内查看更新，并在外部文件冲突时保留任一版本。"
      ]
    }
  });
  assert.match(download, new RegExp(`Tylina ${manifest.version.replaceAll(".", "\\.")}`));
  assert.match(download, new RegExp(`releases/download/v${manifest.version.replaceAll(".", "\\.")}/`));
});

test("does not claim that the proprietary desktop source is public", async () => {
  const home = await built("index.html");
  assert.doesNotMatch(home, /github\.com\/(?:OrangeX4|tylina)\/tylina(?:[\"'/]|$)/i);
  assert.doesNotMatch(home, /open[ -]?source/i);
  assert.match(home, /github\.com\/tylina\/tylina-issues/);
});
