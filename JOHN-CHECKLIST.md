# John's Complete Setup Checklist

Everything left to do, in order, with exact clicks. Steps 1 and 2 are the important ones.
Everything not on this list is already done and running.

---

## ✅ Already done for you (nothing to do)
- Both websites LIVE: colescapitalgroup.com and pinesandponies.com
- Domains, hosting, and code all owned by you (Cloudflare + GitHub, your accounts)
- Your Microsoft email fully working (verified both directions after the move)
- Automatic publishing: any saved change tests itself and goes live in ~2 minutes
- Visitor stats now collecting on both sites (see them anytime: dash.cloudflare.com → Web Analytics)

---

## 1. Give your Claude write access (2 minutes — unlocks everything)
Your Claude can read your sites but not save changes until you approve this on GitHub.
Only you can do it (owner-only security, same as approving the transfers).

1. Click: **https://github.com/apps/claude/installations/new**
2. Sign into GitHub if asked (jcole7172)
3. Choose your account, then pick **All repositories**
4. Click **Install**

Already installed? Then: **https://github.com/settings/installations** → next to "Claude" click
**Configure** → Repository access: **All repositories** → Save.

Then tell your Claude: **"GitHub app is installed, push the logo change."**
It publishes the new nav logo it has ready, and from then on it can change anything you ask.

## 2. Your phone-friendly editing dashboard login (5 minutes)
Each site has a point-and-click editor at colescapitalgroup.com/admin and
pinesandponies.com/admin — great for quick edits from your phone (prices, photos, articles).
It signs in with a GitHub "token" you create once:

1. Click: **https://github.com/settings/personal-access-tokens/new**
2. Token name: `website admin` · Expiration: **1 year** (custom)
3. Repository access: **All repositories**
4. Under Permissions → Repository permissions → find **Contents** → set to **Read and write**
5. Click **Generate token**, then COPY it (starts with `github_pat_`) and save it somewhere
   safe (Notes app is fine)
6. Go to either site's /admin → **Sign In Using Access Token** → paste → done
   (same token works on both sites)

Set a reminder for next July: tokens expire after a year, your Claude can walk you through
making a new one.

## 3. Booking requests straight to your inbox (2 minutes, whenever)
Right now "Request to Book" opens a pre-written email (works fine). This upgrade makes it
send silently in the background instead:

1. Go to **web3forms.com**, enter **jcole@colescapitalgroup.com**, click Create Access Key
2. Copy the key from the email they send you
3. Tell your Claude: **"Set the form key on both sites to: [paste key]"**

## 4. Photos (whenever you have them)
Just attach them in your Claude chat and say where they go:
- "Here are photos for Meadow View, use the first as the main one"
- "Swap the Cole's Capital homepage photo for this"
Phone photos are fine at any size — the sites shrink them automatically.
When the real rental photos are in, also say: **"Take the Preview ribbon off both sites."**

## Later, when the rentals are ready for real online payment + Airbnb calendar sync
Tell your Claude: "set up OwnerRez per the go-live skill" — the whole plan is already written
inside the pinesandponies project. Software runs ~$40/month once rentals are live, not before.

---

**If anything ever acts up:** tell your Claude "undo the last change" (everything is
reversible), or worst case, text Donny. But between your Claude and the dashboards, you're
fully self-sufficient.
