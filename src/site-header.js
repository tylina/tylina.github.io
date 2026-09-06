const bilingual = (zh, en) => `<span data-lang-content="zh">${zh}</span><span data-lang-content="en">${en}</span>`;

const links = [
  ["/#wysiwyg", bilingual("所见即所得", "WYSIWYG")],
  ["/#ai", bilingual("AI 原生", "AI native")],
  ["/#slides", "Slides"],
  ["/#scenes", bilingual("使用场景", "Use cases")],
  ["/demo/", "Demo"],
  ["/download/", bilingual("桌面下载", "Download")],
];

// Render at build time so every route ships complete, identical navigation.
export function renderSiteHeader(pathname) {
  const currentPath = new URL(pathname, "https://tylina.github.io").pathname;
  const navigation = links.map(([href, label]) => {
    const current = !href.includes("#") && (currentPath === href || currentPath === `${href}index.html`);
    return `<a href="${href}"${current ? ' aria-current="page"' : ""}>${label}</a>`;
  }).join("\n          ");
  return `<header class="site-header">
      <div class="header-inner">
        <a class="brand" href="/" aria-label="Tylina home"><img src="/app.png" alt=""><span>Tylina</span></a>
        <nav class="site-nav" aria-label="Primary navigation">
          <button class="site-nav-toggle" type="button" aria-label="Navigation" aria-expanded="false" aria-controls="site-nav-links"><i data-lucide="menu" aria-hidden="true"></i></button>
          <div class="site-nav-links" id="site-nav-links">
            ${navigation}
          </div>
        </nav>
        <div class="language-picker" data-language-picker>
          <button class="language-trigger" type="button" data-language-toggle aria-haspopup="menu" aria-expanded="false" aria-label="Choose language"><i data-lucide="globe-2" aria-hidden="true"></i></button>
          <div class="language-menu" data-language-menu role="menu" aria-label="Language" hidden>
            <button type="button" role="menuitemradio" data-language-option="en"><span>English</span><span class="language-check" aria-hidden="true">✓</span></button>
            <button type="button" role="menuitemradio" data-language-option="zh"><span>简体中文</span><span class="language-check" aria-hidden="true">✓</span></button>
          </div>
        </div>
        <a class="header-primary" href="/app/">${bilingual("开始使用", "Open editor")}</a>
      </div>
    </header>`;
}
