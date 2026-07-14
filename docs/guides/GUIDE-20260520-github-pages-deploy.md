# GUIDE-20260520-github-pages-deploy

## Target

Deploy SilverIce Toolbox to GitHub Pages with the custom domain `toolbox.silvericekey.fun`.

## Repository Settings

1. Open the repository settings for `ZYZ-Labs/ai_engineer_toolbox`.
2. Go to Pages.
3. Set the source to GitHub Actions.
4. Keep the custom domain as `toolbox.silvericekey.fun`.
5. Enable HTTPS after DNS has propagated.

## DNS

For a subdomain, create a CNAME record:

```txt
toolbox.silvericekey.fun CNAME zyz-labs.github.io
```

If the organization Pages domain differs, use the value shown by GitHub Pages settings.

## Build Behavior

- The workflow `.github/workflows/pages.yml` runs on pushes to `master` or `main`.
- It installs with `npm ci`.
- It builds with `npm run build`.
- It uploads `apps/web/out`.
- `apps/web/public/CNAME` is copied into the output during the Next.js static export.

## Repository-Path Preview

The default build is for the custom domain root. For a temporary repository-path preview, build with:

```bash
NEXT_PUBLIC_BASE_PATH=/ai_engineer_toolbox npm run build
```
