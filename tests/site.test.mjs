import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";

const dist = new URL("../dist/", import.meta.url);
const source = new URL("../", import.meta.url);
const built = (path) => readFile(new URL(path, dist), "utf8");

test("builds every public route with bilingual product copy", async () => {
  const [home, demo, download, acp, notFound] = await Promise.all([
    built("index.html"), built("demo/index.html"), built("download/index.html"),
    built("docs/acp/index.html"), built("404.html")
  ]);
  assert.match(home, /Typst，<br>所见即所得。/);
  assert.match(home, /WYSIWYG<br>for Typst\./);
  assert.match(home, /无需在源码与预览之间来回切换/);
  assert.match(home, /without switching back and forth between source and preview/);
  assert.doesNotMatch(home, /让自己的 AI Agent 理解真实文档/);
  assert.match(home, /让 AI 看见文档/);
  assert.match(home, /AI that sees the document/);
  assert.match(home, /页面是编辑器/);
  assert.match(home, /Source stays canonical/);
  assert.match(home, /AI is a collaborator/);
  assert.match(home, /<html lang="en" data-lang="en">/);
  assert.match(home, /data-language-option="en"/);
  assert.match(home, /data-language-option="zh"/);
  assert.match(home, /href="\/demo\/">Demo<\/a>/);
  assert.match(demo, /看看文档优先的编辑体验。/);
  assert.match(demo, /See document-first editing in motion\./);
  assert.match(demo, /<img src="\/demo\.gif" alt="" width="1440" height="824"/);
  assert.match(demo, /<img src="\/slides\.gif" alt="" width="1336" height="748"/);
  assert.match(demo, /模板选择、Slides Mode 编辑、AI 润色与 Visual Diff 审阅/);
  assert.match(demo, /template selection, Slides Mode editing, AI-assisted polishing, and Visual Diff review/);
  assert.match(demo, /href="\/demo\/" aria-current="page">Demo<\/a>/);
  assert.match(download, /href="\/demo\/">Demo<\/a>/);
  for (const page of [demo, download, acp]) {
    assert.match(page, /href="\/#wysiwyg"/);
    assert.match(page, /href="\/#ai"/);
    assert.match(page, /href="\/#slides"/);
    assert.match(page, /href="\/#scenes"/);
    assert.doesNotMatch(page, /href="\/#writing"|href="\/#features"/);
  }
  assert.match(download, /SHA256SUMS\.txt/);
  const releaseAssets = [
    "Tylina-0.3.1-mac-arm64.dmg",
    "Tylina-0.3.1-mac-arm64.zip",
    "Tylina-0.3.1-mac-x64.dmg",
    "Tylina-0.3.1-mac-x64.zip",
    "Tylina-0.3.1-win-arm64.exe",
    "Tylina-0.3.1-win-x64.exe",
    "Tylina-0.3.1-linux-arm64.AppImage",
    "Tylina-0.3.1-linux-arm64.deb",
    "Tylina-0.3.1-linux-x86_64.AppImage",
    "Tylina-0.3.1-linux-amd64.deb",
    "SHA256SUMS.txt",
  ];
  for (const asset of releaseAssets) {
    assert.match(download, new RegExp(`releases/download/v0\\.3\\.1/${asset.replaceAll(".", "\\.")}`));
  }
  assert.doesNotMatch(home, /Tylina 0\.1\.0/);
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

test("presents the complete product story with honest interactive previews", async () => {
  const [home, script, styles] = await Promise.all([
    built("index.html"),
    readFile(new URL("src/site.js", source), "utf8"),
    readFile(new URL("src/styles.css", source), "utf8"),
  ]);

  for (const id of ["wysiwyg", "ai", "slides", "scenes", "acknowledgements"]) {
    assert.match(home, new RegExp(`id="${id}"`));
  }
  assert.doesNotMatch(home, /src="\/demo\.gif"/);
  assert.match(home, /data-editor-mode="document"/);
  assert.match(home, /data-editor-mode="lens"/);
  assert.match(home, /data-editor-mode="split"/);
  assert.match(home, /data-ai-task="improve"/);
  assert.match(home, /data-ai-task="explain"/);
  assert.match(home, /data-ai-task="deck"/);
  assert.match(home, /class="agent-editing-status"/);
  assert.match(home, /class="agent-diff-block" data-tone="removed"/);
  assert.match(home, /class="agent-diff-block" data-tone="added"/);
  assert.match(home, /class="agent-slide-preview"/);
  assert.doesNotMatch(home, /agent-floating-controls/);
  assert.match(home, /data-slide-studio/);
  for (const page of [1, 3, 4, 5, 7, 17]) {
    assert.match(home, new RegExp(`slides-botanical-${page}\\.png`));
  }
  assert.match(home, /data-use-carousel/);
  assert.match(script, /data-editor-preview/);
  assert.match(script, /data-ai-task/);
  assert.match(script, /preview\.dataset\.aiState = button\.dataset\.aiTask/);
  assert.match(script, /data-slide-studio/);
  assert.match(script, /data-use-carousel/);
  assert.match(styles, /\.slide-thumbnails img \{[^}]*height: auto;/);
  assert.match(styles, /\.slide-canvas > img \{[^}]*height: auto;/);
  assert.match(styles, /\.source-lens \{[^}]*width: 100%;[^}]*margin-top: 20px;/);
  assert.doesNotMatch(styles, /\.source-lens \{[^}]*position: absolute;/);
  assert.match(styles, /\.demo-recording-header > div \{ max-width: 900px; \}/);
  assert.doesNotMatch(styles, /\.demo-recording-header \{[^}]*grid-template-columns/);
});

test("publishes all eight real template-backed use cases with attribution", async () => {
  const [home, notices] = await Promise.all([built("index.html"), built("THIRD_PARTY_NOTICES.txt")]);
  const scenes = ["cv", "poster", "social-cover", "chart", "note", "paper", "report", "book"];
  for (const scene of scenes) assert.match(home, new RegExp(`data-scene="${scene}"`));
  assert.doesNotMatch(home, /data-scene="thesis"/);

  const assets = [
    "book-min-book.png", "chart-area.png", "cv-basic-resume.png", "note-bananote.png",
    "paper-accelerated-jacow.png", "poster-pollux.png", "report.png",
    "slides-botanical-1.png", "slides-botanical-3.png", "slides-botanical-4.png",
    "slides-botanical-5.png", "slides-botanical-7.png", "slides-botanical-17.png",
    "social-editorial-grid.png",
  ];
  await Promise.all(assets.map((asset) => access(new URL(`showcase/${asset}`, dist))));
  assert.deepEqual((await readdir(new URL("showcase/", dist))).sort(), [...assets].sort());
  const showcaseBytes = await Promise.all(
    assets.map(async (asset) => (await stat(new URL(`showcase/${asset}`, dist))).size)
  );
  assert.ok(
    showcaseBytes.reduce((total, bytes) => total + bytes, 0) < 2 * 1024 * 1024,
    "homepage showcase images should stay below the 2 MiB transfer budget"
  );

  for (const project of ["basic-resume", "pollux", "bananote", "accelerated-jacow", "breezy-report", "lilaq", "min-book", "SeaSlides"]) {
    assert.match(notices, new RegExp(project));
  }
  assert.match(home, /typst\.app\/universe/);
  assert.match(home, /github\.com\/touying-typ\/touying/);
  assert.match(home, /github\.com\/touying-typ\/seaslides/);
  assert.match(home, /Tylina 不会重新许可第三方作品/);
  assert.match(home, /Tylina does not relicense third-party work/);
  assert.doesNotMatch(home, /slides-anthropic|guizang/i);
  assert.doesNotMatch(notices, /postercise|academic-alt|modern-nju-thesis/i);
});

test("publishes the official brand assets and site metadata", async () => {
  await Promise.all(["app.svg", "app.png", "demo.gif", "slides.gif", "favicon.png", "THIRD_PARTY_NOTICES.txt", "robots.txt", "sitemap.xml", "site.webmanifest", ".nojekyll"].map((path) => access(new URL(path, dist))));
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
    version: "0.3.1",
    downloadUrl: "https://tylina.github.io/download/",
    releaseNotesUrl: "https://github.com/tylina/tylina-issues/releases/tag/v0.3.1",
    highlights: {
      en: [
        "Downloads are more than 50% smaller, while the full editor and native Typst workflow remain intact.",
        "Use a system Codex or connect Claude Code, Kimi Code, OpenCode, and custom ACP Agents."
      ],
      "zh-CN": [
        "安装包缩小超过 50%，完整编辑器与原生 Typst 工作流保持不变。",
        "使用本机 Codex，或连接 Claude Code、Kimi Code、OpenCode 与自定义 ACP Agent。"
      ]
    }
  });
  assert.match(download, new RegExp(`Tylina ${manifest.version.replaceAll(".", "\\.")}`));
  assert.match(download, new RegExp(`releases/download/v${manifest.version.replaceAll(".", "\\.")}/`));
});

test("does not claim that the proprietary desktop source is public", async () => {
  const home = await built("index.html");
  assert.doesNotMatch(home, /github\.com\/(?:OrangeX4|tylina)\/tylina(?:[\"'/]|$)/i);
  assert.doesNotMatch(home, /Tylina (?:is|remains) open[ -]?source/i);
  assert.doesNotMatch(home, /open[ -]?source Typst desktop editor/i);
  assert.match(home, /github\.com\/tylina\/tylina-issues/);
});
