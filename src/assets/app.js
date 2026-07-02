// Pines & Ponies — homepage behavior. Loaded as an external module (CSP: script-src 'self').
const $ = (id) => document.getElementById(id);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// mobile menu
const burger = $('burger');
if (burger) {
  burger.addEventListener('click', () => {
    const menu = $('menu');
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
}

// date inputs default to a sensible upcoming window
const iso = (d) => d.toISOString().split('T')[0];
const now = new Date();
const ci = $('ci'), co = $('co');
if (ci && co) {
  const inDate = new Date(now.getTime() + 86400000);
  const outDate = new Date(now.getTime() + 3 * 86400000);
  ci.min = iso(now); ci.value = iso(inDate);
  co.min = iso(inDate); co.value = iso(outDate);
}

// search jumps to the stays section (real search wires to OwnerRez at launch)
const bookbar = $('bookbar');
if (bookbar) {
  bookbar.addEventListener('submit', (e) => {
    e.preventDefault();
    $('stays').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}

// staggered scroll reveal (skipped entirely under reduced-motion)
const revealables = document.querySelectorAll('.rv');
if (reduceMotion) {
  revealables.forEach((el) => el.classList.add('in'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.14 });
  revealables.forEach((el, i) => { el.style.transitionDelay = `${(i % 3) * 0.08}s`; io.observe(el); });
}
