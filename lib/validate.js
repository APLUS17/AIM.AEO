const FIELDS = {
  company: 'Company name',
  location: 'Location',
  product: 'Product or service',
  industry: 'Industry',
  email: 'Work email'
};

const MAX_LEN = 120;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Returns { ok: true, value } with trimmed fields, or { ok: false, errors } keyed by field.
export function validateInput(body) {
  const errors = {};
  const value = {};

  if (!body || typeof body !== 'object') {
    return { ok: false, errors: { form: 'Request body must be JSON.' } };
  }

  for (const [key, label] of Object.entries(FIELDS)) {
    const raw = typeof body[key] === 'string' ? body[key].trim() : '';
    if (!raw) {
      errors[key] = `${label} is required.`;
    } else if (raw.length > MAX_LEN) {
      errors[key] = `${label} must be ${MAX_LEN} characters or fewer.`;
    } else {
      // Strip control characters so inputs can't break prompt or email formatting.
      value[key] = raw.replace(/[\u0000-\u001f\u007f]/g, ' ');
    }
  }

  if (value.email && !EMAIL_PATTERN.test(value.email)) {
    errors.email = 'Work email must be a valid address.';
  }

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}
