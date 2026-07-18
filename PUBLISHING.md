# Publishing the website

1. Create the public repository `github.com/tylina/tylina.github.io`.
2. Push this repository's `main` branch.
3. In **Settings → Pages**, choose **GitHub Actions** as the source.
4. Wait for the **Deploy website** workflow to finish.
5. Check `/`, `/download/`, `/privacy/`, the language switch, and links to `tylina-issues`.

The workflow builds a static site and uploads only `dist/`. The repository contains the public website, not the proprietary Tylina application source.

The download page links to releases in `tylina/tylina-issues`. Publish release assets there before announcing a downloadable version.
