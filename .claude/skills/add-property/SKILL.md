---
name: add-property
description: Use when John wants to add a new rental property/cabin to Pines & Ponies, or duplicate an existing one. Walks through gathering the details, creating the property file, photos, testing, and publishing.
---

# Add a rental property

The goal: one new Markdown file in `src/properties/` and the site does everything else
(its own page, a home-page card, footer link, search option, sitemap entry, SEO, booking card).

## 1. Gather from John (ask in plain English, one short message)
Required: property name · nightly rate ($) · cleaning fee ($) · sleeps · bedrooms · bathrooms ·
pets allowed? · minimum nights (default 2) · a one-line tagline (e.g. "Lakefront A-frame · hot tub · sleeps 6") ·
5-10 amenities · a couple of sentences describing the place · photos (or "use placeholders for now").

Do NOT ask about slugs, SEO, titles, or descriptions — those auto-generate.

## 2. Create the file
`src/properties/<slug>.md` where slug = lowercase name with dashes (e.g. `birch-hollow`).
Copy the shape of an existing property file. Only these fields are needed:

```yaml
---
name: Birch Hollow
slug: birch-hollow
order: 5            # position on the home page (1 = first)
tagline: Lakefront A-frame · hot tub · private beach
sleeps: 6
beds: 3
baths: 2
pets: true
minNights: 2
rate: 395
cleaning: 110
cardImage: assets/uploads/birch-hollow-card.jpg
gallery:
  - { src: "assets/uploads/birch-hollow-1.jpg", tag: "The A-frame" }
  - { src: "assets/uploads/birch-hollow-2.jpg", tag: "Hot tub" }
amenities:
  - Lakefront with private beach
  - Hot tub
---
Two or three sentences about the place, written warm and simple.
```

## 3. Photos
- Real photos: save them to `src/assets/uploads/` (any size is fine — the build shrinks
  them automatically) and reference `assets/uploads/<file>` as above.
- No photos yet: use a placeholder `https://picsum.photos/seed/<anything>/700/520` and tell John
  to send photos when ready.

## 4. Verify and publish
1. `npm test` — must be fully green (the audit automatically checks the new page too).
2. Commit with a plain message like `Add Birch Hollow property` and push to `main`.
3. Confirm the GitHub Actions run succeeds, then curl the new page URL and the homepage to
   confirm the property appears.
4. Tell John it's live, with the link.
