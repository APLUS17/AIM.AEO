const FIELDS = {
  company: 'Company name',
  url: 'Website URL',
  email: 'Work email'
};

const MAX_LEN = 120;
const MAX_URL_LEN = 200;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "acme.com", "www.acme.com/pricing" and "https://acme.com" all become a clean http(s) URL.
// Returns null for anything that isn't a public-looking web address (no credentials, no IP literals).
export function normalizeUrl(raw) {
  let text = String(raw ?? '').trim();
  if (!text) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(text)) text = `https://${text}`;

  let url;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (url.username || url.password) return null;

  const host = url.hostname.toLowerCase();
  const labels = host.split('.');
  const looksLikeIp = host.startsWith('[') || labels.every(label => /^\d+$/.test(label));
  if (looksLikeIp || labels.length < 2 || labels.some(label => !label)) return null;

  return `${url.protocol}//${url.host}${url.pathname === '/' ? '' : url.pathname}${url.search}`;
}

// Returns { ok: true, value } with trimmed fields, or { ok: false, errors } keyed by field.
export function validateInput(body) {
  const errors = {};
  const value = {};

  if (!body || typeof body !== 'object') {
    return { ok: false, errors: { form: 'Request body must be JSON.' } };
  }

  for (const [key, label] of Object.entries(FIELDS)) {
    const raw = typeof body[key] === 'string' ? body[key].trim() : '';
    const max = key === 'url' ? MAX_URL_LEN : MAX_LEN;
    if (!raw) {
      errors[key] = `${label} is required.`;
    } else if (raw.length > max) {
      errors[key] = `${label} must be ${max} characters or fewer.`;
    } else {
      // Strip control characters so inputs can't break prompt or email formatting.
      value[key] = raw.replace(/[\u0000-\u001f\u007f]/g, ' ');
    }
  }

  if (value.email && !EMAIL_PATTERN.test(value.email)) {
    errors.email = 'Work email must be a valid address.';
  }

  if (value.url) {
    const normalized = normalizeUrl(value.url);
    if (normalized) value.url = normalized;
    else errors.url = 'Enter your website address, like acme.com.';
  }

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}
