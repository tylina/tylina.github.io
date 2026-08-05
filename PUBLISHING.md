# Publishing the website

1. Create the public repository `github.com/tylina/tylina.github.io`.
2. Push this repository's `main` branch.
3. In **Settings → Pages**, choose **GitHub Actions** as the source.
4. Wait for the **Deploy website** workflow to finish.
5. Check `/`, `/demo/`, `/download/`, `/updates/stable.json`, the language switch, and links to `tylina-issues`.

The workflow builds a static site and uploads only `dist/`. The repository contains the public website, not the proprietary Tylina application source.

The download page links to releases in `tylina/tylina-issues`. Publish release assets there before announcing a downloadable version.

`public/updates/stable.json` is the machine-readable release source used by Tylina. Keep its version, release links, and
short `en` / `zh-CN` highlights in sync with the download page and release notes. Highlights are plain text shown in the
in-app notice; keep them concise and do not put Markdown or HTML in them. Future in-app installation metadata must use a
new schema version and include authenticated artifact hashes or signatures; do not repurpose the current link-only schema
for executable updates.
