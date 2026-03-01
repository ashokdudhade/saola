# Saola Documentation

Docusaurus-based documentation for Saola. Content is derived from the codebase and `FEATURES.md`.

## Local Development

From repo root:

```bash
npm run docs:start
```

Or from this directory:

```bash
npm start
```

## Build

```bash
npm run docs:build   # from root
# or
npm run build       # from docs-site/
```

## Deploy to GitHub Pages

The `.github/workflows/deploy-docs.yml` workflow builds and deploys on push to `main`.

**First-time setup:**
1. Go to repo **Settings** → **Pages**
2. Under "Build and deployment", set **Source** to **GitHub Actions**

After the workflow runs, docs will be at `https://<org>.github.io/saola/`.

**Config:** Uses `ashokdudhade` as default org. CI overrides via `GH_ORG` and `GH_REPO` env vars.
