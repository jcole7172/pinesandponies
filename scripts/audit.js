// Static SEO + security + a11y audit for the built site (dist/). Dependency-free.
// Property pages are DERIVED from the content folder so anything added via the
// CMS is automatically quality-gated too. Exits non-zero on any failure.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const propertySlugs = readdirSync(join(ROOT, 'src/properties'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const fm = readFileSync(join(ROOT, 'src/properties', f), 'utf8').match(/^slug:\s*(\S+)/m);
    return fm && fm[1];
  })
  .filter(Boolean);

const PAGES = ['dist/index.html', ...propertySlugs.map((s) => `dist/${s}.html`)];
const SITE_FILES = ['dist/robots.txt', 'dist/sitemap.xml', 'dist/_headers'];

const failures = [];
const fail = (where, msg) => failures.push(`${where}: ${msg}`);
const has = (re, html) => re.test(html);

function auditPage(rel) {
  const path = join(ROOT, rel);
  if (!existsSync(path)) { fail(rel, 'file missing'); return; }
  const html = readFileSync(path, 'utf8');

  // --- SEO ---
  if (!has(/<html[^>]+lang=/i, html)) fail(rel, 'missing <html lang>');
  if (!has(/<meta[^>]+name=["']viewport["']/i, html)) fail(rel, 'missing viewport meta');
  if (!has(/<title>[^<]{10,70}<\/title>/i, html)) fail(rel, 'missing/short title (need 10-70 chars)');
  const descTag = html.match(/<meta[^>]+name=["']description["'][^>]*>/i);
  const descVal = descTag && descTag[0].match(/content=(["'])([\s\S]*?)\1/i);
  if (!descVal) fail(rel, 'missing meta description');
  else if (descVal[2].length < 50 || descVal[2].length > 170)
    fail(rel, `meta description length ${descVal[2].length} (need 50-170)`);
  if (!has(/<link[^>]+rel=["']canonical["']/i, html)) fail(rel, 'missing canonical link');
  for (const p of ['og:title', 'og:description', 'og:type', 'og:url', 'og:image']) {
    if (!has(new RegExp(`property=["']${p}["']`, 'i'), html)) fail(rel, `missing OG tag ${p}`);
  }
  if (!has(/name=["']twitter:card["']/i, html)) fail(rel, 'missing twitter:card');
  if (!has(/<script[^>]+type=["']application\/ld\+json["']/i, html)) fail(rel, 'missing JSON-LD');
  if (!has(/<link[^>]+rel=["'](icon|shortcut icon)["']/i, html)) fail(rel, 'missing favicon');
  if (!has(/<link[^>]+rel=["']manifest["']/i, html)) fail(rel, 'missing web manifest link');

  // --- a11y / semantics ---
  const h1 = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1 !== 1) fail(rel, `must have exactly one <h1> (found ${h1})`);
  if (!has(/skip-link/i, html)) fail(rel, 'missing skip-to-content link');
  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  for (const img of imgs) if (!/\balt=/.test(img)) fail(rel, `<img> without alt: ${img.slice(0, 60)}`);

  // --- security ---
  const ext = html.match(/<a\b[^>]*target=["']_blank["'][^>]*>/gi) || [];
  for (const a of ext) if (!/rel=["'][^"']*noopener/i.test(a)) fail(rel, `target=_blank without rel=noopener: ${a.slice(0, 60)}`);
  if (has(/\b(sk-[a-z0-9]{20,}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|xox[baprs]-)/i, html))
    fail(rel, 'possible secret/token in HTML');
  if (has(/(src|href)=["']http:\/\//i, html)) fail(rel, 'insecure http:// resource (mixed content)');
}

for (const p of PAGES) auditPage(p);
for (const f of SITE_FILES) if (!existsSync(join(ROOT, f))) fail('site', `missing ${f}`);
const hp = join(ROOT, 'dist/_headers');
if (existsSync(hp)) {
  const h = readFileSync(hp, 'utf8');
  for (const hdr of ['Content-Security-Policy', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'Strict-Transport-Security']) {
    if (!h.includes(hdr)) fail('site', `_headers missing ${hdr}`);
  }
}

if (failures.length) {
  console.error(`\n  AUDIT FAILED (${failures.length}):`);
  for (const f of failures) console.error('   ✖ ' + f);
  console.error('');
  process.exit(1);
}
console.log(`\n  ✓ AUDIT PASSED — ${PAGES.length} pages, all SEO/security/a11y checks green.\n`);
