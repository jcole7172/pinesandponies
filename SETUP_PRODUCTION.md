# Production setup (dev notes — Donny)

The repo builds two static sites with Eleventy into `dist/` (`dist/pines`, `dist/coles`) and
auto-deploys to GitHub Pages via `.github/workflows/deploy.yml`. That's the live preview today.

For the real client launch on the two domains, do this:

## 1. Hosting: Cloudflare Pages (one project per domain)
Each site is its own Cloudflare Pages project so `_headers`/CSP apply and each gets its own domain.

- **Build command:** `npm run build`
- **Build output directory:** `dist/pines` (for the Pines project) or `dist/coles` (for the Cole's project)
- **Root directory:** repo root
- Add the custom domain in the project (pinesandponies.com / colescapitalgroup.com).
- `_headers` already lives at `dist/<site>/_headers` and is picked up automatically.

Cole's domain (colescapitalgroup.com) is at GoDaddy with Microsoft email — only repoint the
website DNS (CNAME/A) to Cloudflare Pages; leave the MX/email records alone. John registers
pinesandponies.com (point it at Cloudflare too).

## 2. CMS auth: Decap + GitHub OAuth
The admin (`/admin`) uses GitHub as its backend. GitHub OAuth needs a small auth endpoint:

- Easiest: deploy a tiny **Cloudflare Worker OAuth proxy** (e.g. `sterlingwes/decap-proxy` or
  `i40west/netlify-cms-oauth` style worker). Create a GitHub OAuth App:
  - Homepage URL: the site domain
  - Authorization callback URL: the worker's `/callback`
- Put the worker URL in each `admin/config.yml` as `backend.base_url` (+ `auth_endpoint`).
- Give John a GitHub account with write access to the repo (or use a dedicated editor account).
- Local editing without OAuth: `npx decap-server` then open `/admin` (config has `local_backend: true`).

## 3. Images
Fully automatic. Every card/gallery/portfolio image runs through the `imgUrl` filter: remote
placeholder URLs pass through untouched, and local CMS uploads (they land in `assets/uploads`) are
converted to optimized 1200w WebP at build time (measured ~90% size reduction). Nothing to do at launch.

## 4. OwnerRez (Pines bookings)
When properties go live: create OwnerRez account, add properties, connect Airbnb/Vrbo, generate the
Book Now widget, and replace the preview booking card in `property.njk` with the embed. Uncomment the
OwnerRez sources in `dist/pines/_headers` CSP (already documented inline).

## 5. Lead capture + analytics (both CMS-configurable, zero code)
- **Booking/inquiry forms (Web3Forms, free):** go to web3forms.com, enter the destination email
  (jcole@colescapitalgroup.com or hello@pinesandponies.com), it emails back an access key. Paste the key
  into Site Settings → "Form key" in the site's /admin. Until a key is set, the Request-to-Book button
  falls back to a prefilled email (still works, just less smooth). CSP already allows api.web3forms.com.
- **Analytics (Cloudflare Web Analytics, free):** in the Cloudflare dash → Web Analytics → add site →
  copy the beacon token → paste into Site Settings → "Analytics token". CSP already allows the beacon.
- **Launch day:** uncheck "Preview ribbon" in each site's Site Settings. No code changes needed.
- **CMS is Sveltia** (Decap-compatible config, self-hosted bundle, good mobile support). Two login options,
  verified live: "Sign In with GitHub" (needs the §2 OAuth worker) OR **"Sign In Using Access Token"** — a
  GitHub fine-grained PAT scoped to this repo works with NO OAuth worker at all. Easiest launch path: create
  a PAT for John's GitHub account (contents: read/write on this repo) and he pastes it once; the worker
  becomes optional polish.

## STATUS (2026-07-02)
- pinesandponies.com: LIVE on Cloudflare Pages (John's account), CSP/HSTS enforced, full QA crawl clean.
- colescapitalgroup.com: zone staged with complete M365 email records + Pages domains attached.
  WAITING on John changing GoDaddy nameservers to aldo/dalary.ns.cloudflare.com. After activation:
  verify email in/out, run qa-crawl on the domain, then transfer the registration (auth code held by Donny).
- Deploys: currently direct-upload (`npx wrangler pages deploy dist --project-name=<name>`) from Donny's
  machine using John's CF account. After repo transfer + collaborator access: add a CF API token as a repo
  secret and a wrangler-action step in deploy.yml so pushes auto-deploy to Cloudflare too.
- GitHub repo transfers to jcole7172: initiated, waiting on his accept clicks.
