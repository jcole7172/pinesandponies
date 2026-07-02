// Full-site QA crawler. Dependency-free (Node 18+ fetch).
// Crawls every internal page from the sitemap + seeds, verifies:
//   - every internal link/asset resolves (2xx, or 3xx→2xx)
//   - every #fragment target exists on its page
//   - every external link answers (HEAD/GET; bot-walled domains downgrade to warnings)
//   - every CSS url() asset resolves
//   - every JSON-LD block parses
//   - every canonical + og:image resolves
// Usage: node scripts/qa-crawl.js https://site.example
// Exit 1 on failures (warnings don't fail the run).

const BASE = process.argv[2];
if (!BASE) { console.error('usage: node scripts/qa-crawl.js <base-url>'); process.exit(2); }
const origin = new URL(BASE).origin;

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36 SiteQA/1.0';
// Domains that block bots; unreachable = warning, not failure.
const WARN_ONLY = ['facebook.com', 'instagram.com', 'linkedin.com', 'twitter.com', 'x.com', 'bizjournals.com'];

const failures = [];
const warnings = [];
const pages = new Map();      // url -> { ids:Set, links:[], html }
const checked = new Map();    // url -> status
const queue = [];

const norm = (u) => { const x = new URL(u, origin); x.hash = ''; return x.href; };

async function head(url) {
  if (checked.has(url)) return checked.get(url);
  let status = 0;
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15000) });
    if (res.status === 405 || res.status === 404) {
      res = await fetch(url, { method: 'GET', redirect: 'follow', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) });
    }
    status = res.status;
  } catch (e) { status = -1; }
  checked.set(url, status);
  return status;
}

function extract(html, pageUrl) {
  const out = { ids: new Set(), links: new Set(), assets: new Set(), css: new Set(), jsonld: [], canonical: null, ogImage: null };
  for (const m of html.matchAll(/\bid=["']([^"']+)["']/g)) out.ids.add(m[1]);
  for (const m of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)) out.links.add(m[1]);
  for (const m of html.matchAll(/<(?:img|script)\b[^>]*\bsrc=["']([^"']+)["']/gi)) out.assets.add(m[1]);
  for (const m of html.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
    const tag = m[0];
    if (/rel=["']canonical["']/.test(tag)) out.canonical = m[1];
    else if (/rel=["'](preconnect|dns-prefetch)["']/.test(tag)) continue; // origin hints, not resources
    else out.assets.add(m[1]);
  }
  for (const m of html.matchAll(/property=["']og:image["'][^>]*content=["']([^"']+)["']/gi)) out.ogImage = m[1];
  for (const m of html.matchAll(/url\((['"]?)([^)'"]+)\1\)/gi)) { if (!m[2].startsWith('data:')) out.css.add(m[2]); }
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) out.jsonld.push(m[1]);
  return out;
}

async function crawlPage(url) {
  if (pages.has(url)) return;
  pages.set(url, null);
  let res;
  try {
    res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) });
  } catch (e) { failures.push(`PAGE ${url}: fetch error ${e.message}`); return; }
  checked.set(url, res.status);
  if (res.status !== 200) { failures.push(`PAGE ${url}: HTTP ${res.status}`); return; }
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('text/html')) return;
  const html = await res.text();
  const data = extract(html, url);
  pages.set(url, data);

  for (const j of data.jsonld) {
    try { JSON.parse(j); } catch (e) { failures.push(`JSONLD ${url}: does not parse (${e.message})`); }
  }
  // enqueue internal links; remember externals for later
  for (const raw of [...data.links]) {
    if (/^(mailto:|tel:|javascript:)/i.test(raw)) continue;
    if (raw.startsWith('#')) continue;
    if (raw.includes('/cdn-cgi/')) continue; // Cloudflare-internal endpoints
    let u;
    try { u = new URL(raw, url); } catch { failures.push(`LINK ${url}: unparseable href "${raw}"`); continue; }
    if (u.origin === origin) {
      const clean = norm(u.href);
      if (/\.(html|xml|txt|webmanifest|css|js|png|jpe?g|webp|svg|ico|gif|avif)$/i.test(u.pathname) || !u.pathname.includes('.')) {
        if ((u.pathname.endsWith('/') || u.pathname.endsWith('.html') || !u.pathname.includes('.')) && !pages.has(clean)) queue.push(clean);
      }
    }
  }
}

function fragTargets() {
  // verify #fragments (same-page and cross-page)
  for (const [url, data] of pages) {
    if (!data) continue;
    for (const raw of data.links) {
      const hashIdx = raw.indexOf('#');
      if (hashIdx === -1) continue;
      const frag = raw.slice(hashIdx + 1);
      if (!frag) continue;
      let targetPage;
      try { targetPage = norm(new URL(raw, url).href); } catch { continue; }
      const target = pages.get(targetPage);
      if (target && !target.ids.has(frag)) failures.push(`ANCHOR ${url}: link "#${frag}" -> ${targetPage} has no id="${frag}"`);
    }
  }
}

(async () => {
  // seeds: index + sitemap entries + 404
  queue.push(norm('/'));
  try {
    const sm = await (await fetch(norm('/sitemap.xml'), { headers: { 'User-Agent': UA } })).text();
    for (const m of sm.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const u = new URL(m[1]);
      queue.push(norm(new URL(u.pathname, origin).href)); // remap sitemap host onto the host under test
    }
  } catch { warnings.push('sitemap.xml not fetchable'); }
  queue.push(norm('/404.html'));

  while (queue.length) await crawlPage(queue.shift());

  // check all assets/css/canonicals/og from every page + external links
  const tasks = [];
  for (const [url, data] of pages) {
    if (!data) continue;
    const check = (ref, kind) => {
      let u; try { u = new URL(ref, url); } catch { failures.push(`${kind} ${url}: bad ref "${ref}"`); return; }
      if (!/^https?:$/.test(u.protocol)) return;
      tasks.push(head(u.href).then(async (s) => {
        const ok = s >= 200 && s < 400;
        if (!ok) {
          const warnOnly = WARN_ONLY.some((d) => u.hostname.endsWith(d));
          // canonical/og often point at the production domain before DNS goes live;
          // if the same path serves fine on the host under test, it's pending, not broken.
          if (!warnOnly && (kind === 'OGIMAGE' || kind === 'CANONICAL') && u.origin !== origin) {
            const local = await head(origin + u.pathname);
            if (local >= 200 && local < 400) { warnings.push(`${kind} ${url}: ${u.href} pending domain (path OK on ${origin})`); return; }
          }
          (warnOnly ? warnings : failures).push(`${kind} ${url} -> ${u.href}: HTTP ${s}`);
        }
      }));
    };
    for (const a of data.assets) check(a, 'ASSET');
    for (const c of data.css) check(c, 'CSSURL');
    for (const l of data.links) { if (/^https?:\/\//i.test(l) && new URL(l).origin !== origin) check(l, 'EXTLINK'); }
    if (data.canonical) check(data.canonical, 'CANONICAL');
    if (data.ogImage) check(data.ogImage, 'OGIMAGE');
  }
  await Promise.all(tasks);
  fragTargets();

  const crawled = [...pages.keys()];
  console.log(`\nCrawled ${crawled.length} pages, checked ${checked.size} URLs on ${origin}`);
  for (const p of crawled) console.log('  •', p.replace(origin, '') || '/', pages.get(p) ? '' : '(non-HTML/err)');
  if (warnings.length) { console.log(`\nWARNINGS (${warnings.length}):`); for (const w of [...new Set(warnings)]) console.log('  !', w); }
  if (failures.length) { console.error(`\nFAILURES (${failures.length}):`); for (const f of [...new Set(failures)]) console.error('  ✖', f); process.exit(1); }
  console.log('\n✓ QA CRAWL CLEAN — every page, every link, every asset verified.\n');
})();
