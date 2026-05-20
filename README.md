# AI Engineer Toolbox

AI Engineer Toolbox is a local-first toolbox and study site for AI application engineers.

The project follows the v1 spec in [`AI_Engineer_Toolbox_Spec_v1.md`](AI_Engineer_Toolbox_Spec_v1.md): no accounts, no database, no backend by default, and browser-side processing whenever possible.

## What Is Included

- 14 browser tools across crypto, data, and AI engineering workflows
- 4 MDX study pages for transformer, RAG, agent, and AI application engineering roadmaps
- Static Next.js export for GitHub Pages or Cloudflare Pages
- Monorepo structure with reusable utility packages

## Project Structure

```txt
apps/web          Next.js static frontend
content/study     MDX study content
packages/ui       Shared UI class helpers
packages/utils    Browser-safe utility functions and tests
docs              Agent handoff, plan, progress, and acceptance docs
```

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run lint
npm run test
npm run typecheck
npm run build
```

## Static Deployment

The web app is configured with `output: "export"` and a GitHub Pages workflow at `.github/workflows/pages.yml`.

For the custom domain deployment, the default build uses the site root and copies `apps/web/public/CNAME` into `apps/web/out`:

```txt
toolbox.silvericekey.fun
```

In GitHub repository settings, set Pages source to GitHub Actions. In DNS, point the subdomain to the organization Pages host:

```txt
toolbox.silvericekey.fun CNAME zyz-labs.github.io
```

For GitHub Pages under a repository path without a custom domain, set:

```bash
NEXT_PUBLIC_BASE_PATH=/ai_engineer_toolbox npm run build
```

For Cloudflare Pages, the default build command is:

```bash
npm run build
```

Use `apps/web/out` as the static output directory.

## Privacy Model

Tool inputs are processed locally in the browser whenever possible. The project does not include user accounts, server-side persistence, analytics wiring, ads, or cloud storage.
