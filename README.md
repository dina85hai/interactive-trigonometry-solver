# Interactive Trigonometry Solver

This is the cleaned main trigonometry learning app. It includes:

- Curriculum outline
- Signs of trigonometric ratios
- Graph lessons with a tabbed graphing function tool
- Solving trigonometric equations
- Oblique triangle solver for Sine Rule, Cosine Rule, and area
- Interactive step-by-step exercises

## Student link (GitHub Pages)

After the first successful deploy, students can open:

**https://dina85hai.github.io/interactive-trigonometry-solver/**

## Run Locally

Prerequisite: Node.js

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Deploy to GitHub Pages

This project deploys automatically on every push to `main` via GitHub Actions (`.github/workflows/static.yml`).

### One-time setup on GitHub

1. Open the repository: https://github.com/dina85hai/interactive-trigonometry-solver
2. Go to **Settings → Pages**
3. Under **Build and deployment → Source**, choose **GitHub Actions**
4. Push these changes to `main` (or run the workflow manually from the **Actions** tab)

### Deploy from your computer

```bash
git add .
git commit -m "Set up GitHub Pages deploy"
git push origin main
```

Then open **Actions** on GitHub and wait until **Deploy to GitHub Pages** finishes (green check).

### Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local development server |
| `npm run build` | Production build into `dist/` (Pages-ready base path) |
| `npm run build:pages` | Same as build in production mode |
| `npm run preview` | Preview the built app locally |
| `npm run preview:pages` | Preview with the GitHub Pages base path |

### Notes

- The Vite `base` path is `/interactive-trigonometry-solver/` in production so assets load correctly on GitHub Pages.
- If you rename the GitHub repository, update `base` in `vite.config.ts` to match the new repo name.
