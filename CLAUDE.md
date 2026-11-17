# Minimal Tweaks website: notes for agents

- Next.js 16 App Router (`src/app`). Proxy (middleware) lives in `src/proxy.ts`.
- **One-pager mode is ON**: only the homepage is public; all other pages exist but are hidden behind one flag,
  `ONE_PAGER` in `src/lib/pages.ts`. A request to "unhide the other pages" / "turn the site back into a
  multi-page site" means setting that flag to `false`. Full details: `docs/one-pager-mode.md`.
- Case-study CMS at `/admin`; credentials and storage come from environment variables (see `.env.example`).
- Never commit secrets. `.env*` files are git-ignored except `.env.example`.
