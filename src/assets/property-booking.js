// Property booking sidebar. One script drives every property page from its
// data attributes. Submits real booking requests: POSTs to the form service
// when an access key is configured (Site Settings), otherwise opens a
// prefilled email. All pricing/validation logic is unit-tested (booking.js).
import {
  quote, validateStay, otaSavings, validateInquiry,
  buildInquiryPayload, buildInquirySubject, buildMailtoUrl,
} from './booking.js';

const book = document.querySelector('.book');
if (book) {
  const RATE = Number(book.dataset.rate);
  const CLEAN = Number(book.dataset.clean || 0);
  const MIN_NIGHTS = Number(book.dataset.min || 2);
  const PROPERTY = book.dataset.property || document.title;
  const OWNER_EMAIL = book.dataset.email;
  const FORM_KEY = book.dataset.formkey || '';

  const $ = (id) => document.getElementById(id);
  const iso = (d) => d.toISOString().split('T')[0];
  const money = (n) => '$' + n.toLocaleString('en-US');

  const ci = $('ci'), co = $('co'), err = $('bookErr');
  const now = new Date();
  ci.min = iso(now); ci.value = iso(new Date(now.getTime() + 5 * 86400000));
  co.min = iso(now); co.value = iso(new Date(now.getTime() + 9 * 86400000));

  const showError = (msg) => { err.textContent = msg; err.hidden = false; };
  const clearError = () => { err.hidden = true; };

  function currentQuote() {
    const stay = validateStay(ci.value, co.value, { today: iso(now), minNights: MIN_NIGHTS });
    if (!stay.valid) return { stay };
    return { stay, q: quote({ rate: RATE, nights: stay.nights, cleaning: CLEAN }) };
  }

  function recalc() {
    const { stay, q } = currentQuote();
    if (!stay.valid) { showError(stay.reason); return; }
    clearError();
    $('nl').textContent = `${money(RATE)} × ${stay.nights} night${stay.nights === 1 ? '' : 's'}`;
    $('sub').textContent = money(q.subtotal);
    $('tot').textContent = money(q.total);
    $('saveAmt').textContent = 'Save ~' + money(otaSavings(q.subtotal));
  }

  ci.addEventListener('change', () => {
    if (co.value <= ci.value) { const d = new Date(ci.value); d.setDate(d.getDate() + MIN_NIGHTS); co.value = iso(d); }
    co.min = ci.value; recalc();
  });
  co.addEventListener('change', recalc);

  async function submitRequest() {
    const btn = $('reserve');
    const { stay, q } = currentQuote();
    if (!stay.valid) { showError(stay.reason); return; }

    const name = $('gname').value.trim();
    const email = $('gemail').value.trim();
    const check = validateInquiry({ name, email, message: 'booking request', _gotcha: $('gotcha').value });
    if (!check.valid) {
      if (check.errors.includes('spam')) return; // silently drop bots
      showError(check.errors.includes('name') ? 'Please add your name.' : 'Please add a valid email so we can confirm your dates.');
      return;
    }
    clearError();

    const details = { property: PROPERTY, name, email, checkin: ci.value, checkout: co.value, nights: stay.nights, total: q.total };

    if (!FORM_KEY) {
      // No form service configured yet: open a prefilled email instead.
      const subject = buildInquirySubject(details);
      const body = `Hi, I'd like to book ${PROPERTY} from ${ci.value} to ${co.value} (${stay.nights} nights, quoted ${money(q.total)}).\n\nName: ${name}\nEmail: ${email}`;
      window.location.href = buildMailtoUrl(OWNER_EMAIL, subject, body);
      return;
    }

    btn.disabled = true; btn.textContent = 'Sending…';
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(buildInquiryPayload({ accessKey: FORM_KEY, ...details })),
      });
      if (!res.ok) throw new Error(`form service responded ${res.status}`);
      btn.textContent = 'Request sent ✓';
      btn.style.background = 'var(--moss)';
      showError('');
      err.hidden = true;
    } catch (e) {
      console.error('booking request failed', e);
      btn.disabled = false; btn.textContent = 'Request to Book';
      showError('Something went wrong sending your request. Email us instead: ' + OWNER_EMAIL);
    }
  }

  $('reserve').addEventListener('click', submitRequest);
  recalc();
}
