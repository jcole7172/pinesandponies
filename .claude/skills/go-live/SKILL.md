---
name: go-live
description: Use for launch tasks — putting the site on pinesandponies.com, turning off preview mode, enabling real form delivery and analytics, or connecting OwnerRez real-time booking.
---

# Go live / launch checklist

Full runbook: `SETUP_PRODUCTION.md`. This is the ordered checklist.

## One-time launch
1. **Hosting**: Cloudflare Pages project in JOHN's Cloudflare account, from this repo.
   Build command `npm run build`, output directory `dist`. The `_headers` file (security/CSP)
   applies automatically.
2. **Domain**: pinesandponies.com (registered in John's Cloudflare account) → attach as the
   project's custom domain.
3. **Real form delivery**: free Web3Forms access key for hello@pinesandponies.com →
   `web3formsKey` in `src/_data/site.json` (or Site Settings in /admin). Until then Request-to-Book
   falls back to a prefilled email (it still works).
4. **Analytics**: Cloudflare Web Analytics beacon token → `analyticsToken` in site.json.
5. **Ribbon off**: `previewMode: false`.
6. **CMS login**: /admin uses GitHub. Easiest: fine-grained personal access token scoped to this
   repo (Contents: read/write) → Sveltia "Sign In Using Access Token". If the repo is
   renamed/transferred, update `backend.repo` in `src/admin/config.yml`.
7. Publish, then verify the live domain including `/admin`.

## Later: real-time paid bookings (OwnerRez)
- OwnerRez account → add properties → connect Airbnb + Vrbo channel manager (two-way sync).
- Replace the booking card in `src/_includes/property.njk` with the OwnerRez widget embed.
- Extend the CSP in `src/headers.njk` with https://secure.ownerreservations.com
  (script/frame/connect/img) — the commented block is already there.
- Furnished Finder never syncs (no API/iCal export) — John blocks those dates by hand.
