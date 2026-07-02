# Pines & Ponies — pinesandponies.com

The direct-booking vacation rental website for Pines & Ponies LLC (Saratoga Springs / Lake George /
Upstate NY). Owned and managed by **John Cole**, who is NOT a developer. If you are Claude working
in this repo: your user is likely John. Talk in plain English, no jargon, explain what you did in
one or two sentences, and run commands yourself rather than asking him to.

Built with Eleventy (static site generator). Content lives as small Markdown/JSON files; editing a
file and pushing = the site updates itself. The sister site (Cole's Capital Group, the parent
company) lives in its own separate repo: `colescapitalgroup`.

## Golden rules (do not skip)
1. **Run `npm test` before every push** (build + unit tests + SEO/security/a11y audit). If it
   fails, fix the cause — never delete or weaken a test/audit rule to get green.
2. **Pushing to `main` deploys automatically** (GitHub Actions). After pushing, confirm the run
   succeeded and spot-check the live page.
3. **Never commit secrets.** The only "key-like" values allowed are the public Web3Forms key and
   analytics token in `src/_data/site.json` (public by design).
4. **Don't weaken security/SEO**: `src/headers.njk` (CSP/security headers), `scripts/audit.js`,
   and `test/` protect the site. Extend, don't gut.
5. **Keep changes minimal**; the design is owner-approved. Content edits are routine; design
   changes should be confirmed with John first.
6. Booking math lives in `src/assets/booking.js` and is unit-tested (`test/booking.test.js`).
   Changing pricing logic = update tests first.

## Common jobs
| John says | What to do |
|---|---|
| "Add a new rental/cabin" | **add-property** skill. One new file in `src/properties/` — human fields only; SEO auto-generates. |
| "Change a price / min nights / amenities / photos" | Edit `src/properties/<slug>.md`. |
| "Change phone/email/socials/hero photo/banner" | `src/_data/site.json`. |
| "Go-live things" (ribbon off, form key, analytics) | `previewMode`, `web3formsKey`, `analyticsToken` in site.json — or the **go-live** skill. |
| "Put this photo on the site" | Save under `src/assets/uploads/`, reference `assets/uploads/<file>`. Build auto-optimizes (huge phone photos fine). |
| "Publish / make it live" | **publish** skill: npm test → commit → push → verify. |

## Commands
```
npm ci        # install (first time)
npm test      # build + all tests + audit (must pass before pushing)
npm run dev   # local preview at localhost:8080
```

## Map
- `src/properties/*.md` — one file per rental (name, slug, order, rate, cleaning, sleeps, beds,
  baths, pets, minNights, tagline, cardImage, gallery, amenities, body). SEO fields optional —
  auto-derived in `src/properties/properties.11tydata.js`.
- `src/_data/site.json` — contact, socials, launch toggles, hero image, form/analytics keys.
- `src/_includes/` — templates. `src/assets/styles.css` — design.
- `src/admin/` — visual CMS (Sveltia). **If this repo is renamed/transferred, update
  `backend.repo` in `src/admin/config.yml`.**
- Booking today: "Request to Book" emails John the guest's name/dates/quote (Web3Forms when
  `web3formsKey` is set, prefilled email otherwise). Real-time paid booking comes later via
  OwnerRez (seam + CSP notes in `src/headers.njk`). Furnished Finder cannot sync (no API) — those
  dates are managed by hand; that's their limitation, not a bug.

## Live QA
After any deploy, run the full-site crawler against the live site:
```
node scripts/qa-crawl.js https://<the-live-url>
```
It checks every page, every link, every asset, every anchor, JSON-LD, canonicals, and og images. Fix any FAILURES before telling John something is done. (Bot-walled domains like Facebook/bizjournals appear as warnings — that is expected.)
