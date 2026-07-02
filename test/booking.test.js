import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  nightsBetween,
  validateStay,
  quote,
  otaSavings,
  isValidEmail,
  validateInquiry,
} from '../src/assets/booking.js';

test('nightsBetween counts whole nights', () => {
  assert.equal(nightsBetween('2026-07-01', '2026-07-05'), 4);
  assert.equal(nightsBetween('2026-07-01', '2026-07-02'), 1);
});

test('nightsBetween returns 0 for same/invalid/reversed dates', () => {
  assert.equal(nightsBetween('2026-07-05', '2026-07-05'), 0);
  assert.equal(nightsBetween('2026-07-05', '2026-07-01'), 0);
  assert.equal(nightsBetween('', '2026-07-01'), 0);
  assert.equal(nightsBetween('not-a-date', '2026-07-01'), 0);
});

test('validateStay enforces order, min-nights, and no past check-in', () => {
  const today = '2026-06-29';
  assert.equal(validateStay('2026-07-01', '2026-07-04', { today, minNights: 2 }).valid, true);
  // checkout before checkin
  assert.equal(validateStay('2026-07-04', '2026-07-01', { today }).valid, false);
  // below min nights
  const tooShort = validateStay('2026-07-01', '2026-07-02', { today, minNights: 2 });
  assert.equal(tooShort.valid, false);
  assert.match(tooShort.reason, /minimum/i);
  // check-in in the past
  assert.equal(validateStay('2026-06-01', '2026-06-10', { today }).valid, false);
});

test('quote computes subtotal, cleaning, taxes, and total', () => {
  const q = quote({ rate: 285, nights: 4, cleaning: 95, taxRate: 0 });
  assert.equal(q.subtotal, 1140);
  assert.equal(q.cleaning, 95);
  assert.equal(q.taxes, 0);
  assert.equal(q.total, 1235);
});

test('quote applies a tax rate to subtotal + cleaning', () => {
  const q = quote({ rate: 100, nights: 2, cleaning: 50, taxRate: 0.1 });
  // (200 + 50) * 0.10 = 25
  assert.equal(q.taxes, 25);
  assert.equal(q.total, 275);
});

test('quote throws on invalid inputs (no silent failure)', () => {
  assert.throws(() => quote({ rate: -1, nights: 2 }));
  assert.throws(() => quote({ rate: 100, nights: 0 }));
});

test('otaSavings estimates rounded platform fee savings', () => {
  // ~15% of 1000 = 150, rounded to nearest $5
  assert.equal(otaSavings(1000, 0.15), 150);
  assert.equal(otaSavings(1140, 0.15), 170); // 171 -> nearest 5 = 170
  assert.equal(otaSavings(0, 0.15), 0);
});

test('isValidEmail accepts good and rejects bad', () => {
  assert.equal(isValidEmail('john@example.com'), true);
  assert.equal(isValidEmail('a.b+c@sub.domain.co'), true);
  assert.equal(isValidEmail('nope'), false);
  assert.equal(isValidEmail('no@domain'), false);
  assert.equal(isValidEmail(''), false);
});

test('validateInquiry requires fields, valid email, and blocks honeypot spam', () => {
  const good = validateInquiry({ name: 'John', email: 'john@example.com', message: 'Hi', _gotcha: '' });
  assert.equal(good.valid, true);
  assert.equal(good.errors.length, 0);

  const missing = validateInquiry({ name: '', email: 'bad', message: '', _gotcha: '' });
  assert.equal(missing.valid, false);
  assert.ok(missing.errors.includes('name'));
  assert.ok(missing.errors.includes('email'));
  assert.ok(missing.errors.includes('message'));

  // honeypot filled => treated as spam, invalid
  const spam = validateInquiry({ name: 'Bot', email: 'bot@x.com', message: 'spam', _gotcha: 'filled' });
  assert.equal(spam.valid, false);
  assert.ok(spam.errors.includes('spam'));
});

// --- inquiry submission helpers (real lead capture) ---
import { buildInquirySubject, buildMailtoUrl, buildInquiryPayload } from '../src/assets/booking.js';

test('buildInquirySubject formats property + dates', () => {
  assert.equal(
    buildInquirySubject({ property: 'Pine Ridge Cottage', checkin: '2026-08-01', checkout: '2026-08-06' }),
    'Booking request: Pine Ridge Cottage, 2026-08-01 to 2026-08-06',
  );
});

test('buildMailtoUrl encodes subject and body safely', () => {
  const url = buildMailtoUrl('hi@x.com', 'A & B', 'line1\nline2 100%');
  assert.ok(url.startsWith('mailto:hi@x.com?subject='));
  assert.ok(url.includes('A%20%26%20B'));
  assert.ok(url.includes('line1%0Aline2%20100%25'));
});

test('buildInquiryPayload maps fields for the form service', () => {
  const p = buildInquiryPayload({
    accessKey: 'k123', property: 'Lakeside Retreat', name: 'Jane', email: 'jane@x.com',
    checkin: '2026-09-04', checkout: '2026-09-07', nights: 3, total: 1395,
  });
  assert.equal(p.access_key, 'k123');
  assert.equal(p.subject, 'Booking request: Lakeside Retreat, 2026-09-04 to 2026-09-07');
  assert.equal(p.name, 'Jane');
  assert.equal(p.email, 'jane@x.com');
  assert.match(p.message, /Lakeside Retreat/);
  assert.match(p.message, /3 night/);
  assert.match(p.message, /\$1,395/);
  assert.equal(p.botcheck, false);
});

test('buildInquiryPayload throws without an access key (no silent misconfig)', () => {
  assert.throws(() => buildInquiryPayload({ accessKey: '', property: 'X', name: 'A', email: 'a@b.co', checkin: '2026-01-01', checkout: '2026-01-03', nights: 2, total: 100 }));
});
