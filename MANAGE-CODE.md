# Controlling Your Website Code & Deployments — John Cole's Owner Manual

This file teaches Claude how to make ANY change to your websites — design, features, new pages,
whole new sections — and ship it to the live internet, with no developer involved. A copy lives in
each GitHub project so Claude loads it automatically when connected.

## The stack (what Claude is working with)
- Two independent projects on your GitHub: `jcole7172/colescapitalgroup` and
  `jcole7172/pinesandponies`. You own them outright; every file is yours.
- Each is a static site built with **Eleventy**: content in Markdown/JSON, design in templates
  (`src/_includes/`) and one stylesheet (`src/assets/styles.css`). No frameworks, no database.
- Hosting: **Cloudflare Pages** in YOUR Cloudflare account (the same login where your domains
  live). Free, fast, includes security headers from the `_headers` file.
- Booking logic (rental site) is in `src/assets/booking.js` with unit tests in `test/`.

## The workflow Claude must follow for every change
1. Make the change (smallest edit that does the job; match the existing style).
2. `npm ci` (first time) then **`npm test`** — builds the site and runs unit tests plus an
   SEO/security/accessibility audit on the built pages. Must be fully green. Never delete or
   weaken a test or audit rule to get green; fix the actual problem.
3. Commit with a plain-English message and **push to `main`**.
4. Pushing IS deploying: GitHub Actions builds, re-tests, and publishes automatically —
   a preview to GitHub Pages and production to Cloudflare Pages (the real domain).
5. Verify: confirm the Actions run succeeded, then run the site crawler against the live domain:
   `node scripts/qa-crawl.js https://<the-domain>` — it checks every page, link, asset, and
   anchor. Fix any FAILURES (bot-walled sites like Facebook show as warnings; that's normal).
6. Tell John, in one or two plain sentences, what changed and that it's live.

## Local commands
```
npm ci        # install dependencies (first time on a machine)
npm test      # build + full quality gate (required before any push)
npm run dev   # live local preview at localhost:8080
node scripts/qa-crawl.js <url>   # full-site crawl of a deployed site
```

## Hard rules (non-negotiable)
- **Never commit secrets** — no API tokens, passwords, or keys in any file. The only allowed
  key-ish values are the public form key and analytics token in `src/_data/site.json`.
- **Don't weaken security**: `src/headers.njk` defines the Content-Security-Policy and security
  headers. Extend carefully (e.g., adding an allowed domain for a new embed), never remove.
- **The Cole's domain carries Microsoft 365 email.** Never touch DNS records for
  colescapitalgroup.com without reading SETUP_PRODUCTION.md first. Website changes never require
  DNS changes.
- **Design changes**: confirm with John before big visual redesigns; content and small improvements
  don't need permission.
- If a deploy breaks something: `git revert` the bad commit and push — that redeploys the previous
  good version. Everything is recoverable.

## One-time setup that makes push-to-production work
Each repo needs one secret so GitHub can publish to Cloudflare:
- GitHub repo → Settings → Secrets and variables → Actions → New repository secret
- Name: `CLOUDFLARE_API_TOKEN`  Value: (John has this — it only permits publishing website files,
  nothing else, and can be revoked in Cloudflare → My Profile → API Tokens anytime)
Until the secret is set, the workflow skips the production step and Claude (or Donny) can deploy
manually with: `npx wrangler pages deploy dist --project-name=<pinesandponies|colescapitalgroup>`
(needs `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID=2ec33f9f741ab922533b84e11dbda045` env vars).

## Where the deeper docs live (inside each repo)
- `CLAUDE.md` — the per-site instructions Claude auto-loads
- `.claude/skills/` — step-by-step playbooks (add-property, update-content, publish, go-live)
- `JOHN_GUIDE.md` — the plain-English owner guide
- `SETUP_PRODUCTION.md` — hosting, DNS, email records, launch runbook
- Future: real-time paid bookings via OwnerRez (rental site) — the integration seam and checklist
  are in the pines repo's go-live skill and SETUP_PRODUCTION.md.
