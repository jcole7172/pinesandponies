---
name: publish
description: Use whenever changes are ready to go live, or John says "publish", "make it live", "deploy", or asks why an edit isn't showing. The safe path from edited files to verified-live.
---

# Publish changes (safe deploy)

Pushing to `main` IS the deploy — GitHub Actions builds, runs the full quality gate, and ships
the site. Never push red.

## Steps
1. `npm test` — build + unit tests + SEO/security/accessibility audit. All green or stop and fix.
   Never delete/weaken a test or audit rule to get green.
2. Review what's being committed (`git status`, `git diff --stat`) — only intended files, never
   secrets, never `dist/`.
3. Commit with a plain-English message ("Raise Pine Ridge to $375", "Add Malta project article").
4. `git push origin main`.
5. Watch the deploy: `gh run watch $(gh run list --limit 1 --json databaseId -q '.[0].databaseId') --exit-status`
6. Spot-check live (curl the changed page and grep for the new content). GitHub Pages can take a
   minute after the run finishes; retry briefly before declaring a problem.
7. Tell John, in one or two plain sentences, what is now live, with the link.

## If the deploy fails
- Read the Actions log, fix the actual cause, run `npm test` locally, push again.
- If a bad change is live and the fix isn't obvious: `git revert` the bad commit and push — that
  redeploys the previous good version. Every change is reversible; say so to John if he's worried.

## Live URLs
- Preview (until custom domains): https://<github-owner>.github.io/<repo-name>/
- Production (after launch): https://colescapitalgroup.com and https://pinesandponies.com
  (Cloudflare Pages auto-builds from this same repo; see SETUP_PRODUCTION.md)
