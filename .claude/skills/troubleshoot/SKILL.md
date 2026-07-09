---
name: troubleshoot
description: Use when anything seems broken — site down, changes not showing up, deploy failed, admin login not working, booking requests not arriving, images missing. Diagnostic runbook with fixes.
---

# When something's wrong — diagnose, then fix

Work down this list. Tell John what you found in plain English, fix it, verify, then confirm.

## "The site is down / won't load"
1. `curl -sI https://<domain>/` — check the status code.
2. 200 = site is fine; the problem is John's device/network (have him try another device).
3. 5xx = check Cloudflare status (cloudflarestatus.com) and the Pages deployment list — a bad
   deploy can be rolled back in Cloudflare dash → Workers & Pages → the project → Deployments →
   previous deployment → Rollback.
4. DNS errors = check the domain hasn't expired (it auto-renews, but verify in Cloudflare →
   Domain Registration).

## "I made a change but it's not showing"
1. Was it committed AND pushed? `git log origin/main -3`.
2. Did CI pass? `gh run list --limit 3` — if a run failed, read the log (`gh run view <id>
   --log-failed`), fix the actual cause, push again. NEVER delete tests to force green.
3. CI green but page stale? It's browser/CDN cache — hard-refresh (Ctrl+Shift+R), or wait ~2
   min. Verify reality with `curl -s https://<domain>/<page> | grep '<the change>'`.

## "The deploy failed"
- `npm test` locally (or in the session) — if red, the change broke something; fix it.
- If `deploy-production` was skipped: the CLOUDFLARE_API_TOKEN repo secret is missing/revoked.
  Recreate: Cloudflare dash → My Profile → API Tokens → Create Token → custom, permission
  "Cloudflare Pages: Edit" on the account → copy → GitHub repo Settings → Secrets → Actions →
  update CLOUDFLARE_API_TOKEN. Manual fallback deploy:
  `CLOUDFLARE_API_TOKEN=<token> CLOUDFLARE_ACCOUNT_ID=2ec33f9f741ab922533b84e11dbda045 npx wrangler pages deploy dist --project-name=<project>`

## "I can't log into /admin"
- Token expired (they last ~1 year) or was revoked. Make a new one:
  github.com/settings/personal-access-tokens/new → All repositories → Contents: Read and write →
  Generate → paste into /admin "Sign In Using Access Token".

## "Booking requests aren't reaching my email" (Pines)
- Is `web3formsKey` set in `src/_data/site.json`? Empty = requests open the guest's email app
  instead (still works, just not silent). Get a free key at web3forms.com for the owner's email.
- Key set but nothing arriving: check spam, then log into web3forms.com and check the submission
  log.

## "Images look broken"
- Browser console will show CSP violations if an image host isn't allowed — add the host to
  `img-src` in `src/headers.njk` (never remove existing entries), push.
- Local images must live under `src/assets/` and be referenced as `assets/...`.

## "Undo the last change"
- `git revert HEAD && git push` — redeploys the previous good version. For anything older:
  `git log --oneline` to find the bad commit, `git revert <sha>`, push.

## Nuclear option (never actually needed)
Every version of everything is in git history. `git checkout <sha> -- <file>` restores any file
from any point in time. Nothing is ever lost.

## After ANY fix
`npm test` green → push → CI green → `node scripts/qa-crawl.js https://<domain>` clean → tell
John it's fixed in one plain sentence.
