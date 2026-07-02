---
name: update-content
description: Use for everyday edits — property prices/details/photos, contact info, socials, hero photo, launch banner, or any Site Settings toggle. Maps each request to the right file.
---

# Update site content

Every routine edit is a small change to one content file. Make the minimal edit, then verify +
publish (use the **publish** skill).

## Properties
| Change | Where | Notes |
|---|---|---|
| Price, cleaning fee, min nights, sleeps/beds/baths, pets | `src/properties/<slug>.md` | Booking card + home cards update automatically |
| Amenities, tagline, description | same file | |
| Photos | same file (`cardImage`, `gallery`) | New photos go in `src/assets/uploads/`; big phone photos are fine (auto-optimized) |
| Remove a property | delete its file | Page, card, footer link, sitemap all disappear |
| Reorder home page cards | `order:` field (1 = first) | |

## Settings (`src/_data/site.json`)
- Contact: `email`, `phone` + `phoneHref` (`+1` then digits, e.g. `+15183300224`)
- Socials: `social.instagram` / `facebook` (full URLs; empty string hides the link)
- Hero photo: `heroImage` — e.g. `assets/uploads/hero.jpg` (auto-optimized); empty = default
- Launch messaging: `launchMode`, `launchBanner`, `launchNote`
- Launch toggles: `previewMode` (corner ribbon), `web3formsKey` (real form delivery),
  `analyticsToken` (Cloudflare Web Analytics)

## Rules
- Never edit `dist/` (generated).
- Dollar amounts are plain numbers (`rate: 395`, no $ sign).
- Keep the voice warm and plain, no marketing fluff.
- Finish with `npm test` + publish, then tell John what changed in one sentence.
