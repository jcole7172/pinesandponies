// Booking + inquiry logic for Pines & Ponies.
// Pure, framework-free, unit-tested. Imported by the page and the test suite.
// Crash loud on invalid input; never fail silently.

const MS_PER_DAY = 86_400_000;

function toUTCDate(iso) {
  if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  // guard against rollover (e.g. 2026-02-31)
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return dt;
}

export function nightsBetween(checkinISO, checkoutISO) {
  const a = toUTCDate(checkinISO);
  const b = toUTCDate(checkoutISO);
  if (!a || !b) return 0;
  const n = Math.round((b - a) / MS_PER_DAY);
  return n > 0 ? n : 0;
}

export function validateStay(checkinISO, checkoutISO, { today, minNights = 2 } = {}) {
  const a = toUTCDate(checkinISO);
  const b = toUTCDate(checkoutISO);
  if (!a || !b) return { valid: false, reason: 'Please choose valid dates.' };

  if (today) {
    const t = toUTCDate(today);
    if (t && a < t) return { valid: false, reason: 'Check-in cannot be in the past.' };
  }

  const n = nightsBetween(checkinISO, checkoutISO);
  if (n <= 0) return { valid: false, reason: 'Check-out must be after check-in.' };
  if (n < minNights) return { valid: false, reason: `This stay has a ${minNights}-night minimum.` };

  return { valid: true, reason: '', nights: n };
}

export function quote({ rate, nights, cleaning = 0, taxRate = 0 }) {
  if (typeof rate !== 'number' || rate <= 0) throw new Error(`quote: invalid rate ${rate}`);
  if (!Number.isInteger(nights) || nights <= 0) throw new Error(`quote: invalid nights ${nights}`);
  if (cleaning < 0 || taxRate < 0) throw new Error('quote: cleaning/taxRate must be >= 0');

  const subtotal = rate * nights;
  const taxes = Math.round((subtotal + cleaning) * taxRate);
  const total = subtotal + cleaning + taxes;
  return { subtotal, cleaning, taxes, total };
}

// Rough "what a guest saves vs an OTA" estimate, rounded to nearest $5.
export function otaSavings(subtotal, rate = 0.15) {
  if (typeof subtotal !== 'number' || subtotal <= 0) return 0;
  return Math.round((subtotal * rate) / 5) * 5;
}

export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  // pragmatic RFC-lite: local@domain.tld with a real TLD
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function validateInquiry({ name, email, message, _gotcha } = {}) {
  const errors = [];
  // honeypot: real users never fill this hidden field
  if (_gotcha) errors.push('spam');
  if (!name || !String(name).trim()) errors.push('name');
  if (!isValidEmail(email)) errors.push('email');
  if (!message || !String(message).trim()) errors.push('message');
  return { valid: errors.length === 0, errors };
}

// --- Inquiry submission helpers ---
// The site captures booking requests two ways: a form service POST when an
// access key is configured (site settings), or a prefilled mailto fallback.

export function buildInquirySubject({ property, checkin, checkout }) {
  return `Booking request: ${property}, ${checkin} to ${checkout}`;
}

export function buildMailtoUrl(email, subject, body) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildInquiryPayload({ accessKey, property, name, email, checkin, checkout, nights, total, message = '' }) {
  if (!accessKey) throw new Error('buildInquiryPayload: missing form access key');
  const summary = `Booking request for ${property}\nDates: ${checkin} to ${checkout} (${nights} night${nights === 1 ? '' : 's'})\nQuoted total: $${Number(total).toLocaleString('en-US')}\nGuest: ${name} <${email}>${message ? `\n\n${message}` : ''}`;
  return {
    access_key: accessKey,
    subject: buildInquirySubject({ property, checkin, checkout }),
    name,
    email,
    message: summary,
    botcheck: false,
  };
}
