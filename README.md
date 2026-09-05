# Tylina website

This repository contains the public website for [Tylina](https://tylina.github.io/), a document-first Typst editor for Web and desktop.

The desktop application is proprietary software. This repository contains the public website and pins a compiled Web application artifact. It does not contain the Tylina application source code.

## Local preview

```bash
npm install
npm run dev
```

Run `npm test` before publishing. The site is a static Vite build; `main` is deployed to GitHub Pages by `.github/workflows/pages.yml`.

## Public links

- Website: <https://tylina.github.io/>
- Web editor: <https://tylina.github.io/app/>
- Demo: <https://tylina.github.io/demo/>
- Downloads: <https://github.com/tylina/tylina-issues/releases>
- Feedback: <https://github.com/tylina/tylina-issues/issues/new/choose>

Copyright © 2026 OrangeX4. All rights reserved.

## Web application builds

`web-app.json` pins the compiled editor to a versioned public release and SHA-256.
`npm run build` downloads and verifies the artifact, then installs it into
`dist/app/`. The homepage and existing download, demo and documentation routes
remain independent of the editor. An invalid or unavailable artifact fails the
build instead of publishing a broken editor entry.

For local verification, `TYLINA_WEB_ARCHIVE` can point to the same archive;
its pinned size and SHA-256 are still required. Publishing a newer build or
rolling back changes `web-app.json` and runs the same Pages workflow.
