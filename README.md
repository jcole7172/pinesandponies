# Pines & Ponies

Direct-booking vacation rental website for Pines & Ponies LLC — cabins and lake retreats around
Saratoga Springs, Lake George, and Upstate New York. Live at **pinesandponies.com**.

- **Owner:** John Cole (Pines & Ponies LLC)
- **Everyday edits:** the visual dashboard at `/admin` (see `JOHN_GUIDE.md`)
- **Bigger changes:** ask Claude — this repo carries its own instructions (`CLAUDE.md` +
  `.claude/skills/`) so the AI knows exactly how to add properties, change content, and publish
- **Stack:** Eleventy static build, content as Markdown/JSON, Sveltia CMS, GitHub Actions deploy,
  quality gate on every push (`npm test` = build + unit tests + SEO/security/accessibility audit)

```
npm ci        # install
npm test      # build + full quality gate
npm run dev   # local preview
```

Push to `main` = automatic build, test, and deploy. See `SETUP_PRODUCTION.md` for hosting/launch
and `TRANSFER.md`-equivalent notes in the parent company repo.

The corporate parent site (Cole's Capital Group) lives in its own repo: `colescapitalgroup`.
