# Managing Your Website Content — John Cole's Owner Manual

Give this file to Claude (or just have Claude open your website project on GitHub — a copy lives
there and loads automatically). It teaches Claude how to change anything on either of your two
websites. You describe what you want in plain English; Claude does it, tests it, and publishes it.

## Your two websites
| Site | Address | Code lives at (GitHub) |
|---|---|---|
| Cole's Capital Group | colescapitalgroup.com | jcole7172/colescapitalgroup |
| Pines & Ponies | pinesandponies.com | jcole7172/pinesandponies |

They are separate on purpose: separate businesses, separate sites, separate control.

## Things you can just say to Claude (real examples)

**Pines & Ponies (rentals):**
- "Add a new cabin called Birch Hollow, $395 a night, sleeps 6, 3 bedrooms, 2 baths, hot tub,
  lakefront, pets okay" — it gets its own page, home-page card, and booking box automatically
- "Raise Pine Ridge to $375 a night" / "Change the cleaning fee on Lakeside to $135"
- "Here are photos for Meadow View" (attach or upload them) — Claude places and optimizes them,
  phone photos are fine
- "Remove the Carriage House listing"
- "Change the banner to say Opening Spring 2027"
- "Take the Preview ribbon off, we're going fully live"

**Cole's Capital Group (company site):**
- "Add this Albany Business Review article: [paste link]"
- "The Malta project is finished, move it to the track record as a 2026 development project"
- "We started a new project: self-storage facility in Clifton Park, delivering 2028"
- "Update assets under management to $25M"
- "Swap the big homepage photo for the one I'm attaching"

**Either site:**
- "Change the contact phone number to ..." / "Point the contact email to ..."
- "Add our LinkedIn to the footer"

## How content is organized (what Claude edits)
- Rentals: one small file per property in `src/properties/` — name, slug, order, rate, cleaning,
  sleeps, beds, baths, pets, minNights, tagline, photos (cardImage + gallery), amenities, and a
  short description. Titles and search-engine text auto-generate; nobody needs to write SEO.
- Company site: one small file per item in `src/press/`, `src/pipeline/` (upcoming projects),
  `src/projects/` (finished projects), `src/stats/` (the big numbers), `src/portfolio/`.
- Contact info, social links, hero photo, and launch switches: `src/_data/site.json` on each site.
- Photos: save into `src/assets/uploads/` and reference as `assets/uploads/<name>.jpg`. The build
  automatically shrinks them (a 4MB phone photo becomes ~100KB) so the site stays fast.

## Publishing (how a change goes live)
Claude saves the change to GitHub ("push to main"). That automatically builds the site, runs the
full test suite, and publishes to your real domain within a couple of minutes. Nothing else to do.
Claude should always run `npm test` before pushing and confirm the deploy finished, then check the
live page.

## Turning on the last two features (one-time, Claude can walk you through it)
- **Silent booking-request delivery:** create a free key at web3forms.com using your email, then
  tell Claude "set the form key to <key>". Until then, Request-to-Book opens a pre-written email
  instead (which also works).
- **Visitor stats:** in your Cloudflare dashboard, Web Analytics → add site → copy the token →
  tell Claude "set the analytics token to <token>".

## Safety net
Every change ever made is saved in history. Nothing is unfixable — tell Claude "undo the last
change" and it reverts. Claude must never delete tests, weaken security settings, or put passwords
in files (the project rules it reads enforce this).
