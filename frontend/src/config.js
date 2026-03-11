/**
 * Backend API base URL for all frontend requests.
 * Set VITE_API_URL in frontend/.env (or Vercel env vars) to override.
 * No trailing slash. Default http for local dev (backend usually has no SSL).
 */
export const API_BASE =
   import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:8000';

/**
 * Timezone for the DMV area (DC, Maryland, Virginia). All displayed dates/times use this.
 */
export const TIMEZONE = 'America/New_York';

/** Format options for date/time display in DC timezone */
const tz = { timeZone: TIMEZONE };

export function formatInDC(date, options = {}) {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleString(undefined, { ...tz, ...options });
}

export function formatDateInDC(date, options = {}) {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleDateString(undefined, { ...tz, ...options });
}

export function formatTimeInDC(date, options = {}) {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleTimeString(undefined, { ...tz, ...options });
}

/** Today's date key (YYYY-MM-DD) in DC timezone, for "today" comparisons. */
export function todayKeyInDC() {
  return new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE });
}

/**
 * Business contact info – change here to update everywhere (Contact, Footer, etc.).
 * For phone use digits only or format like (410) 575-4616; tel: links work with both.
 */
export const BUSINESS = {
  phone: '(202) 250-4842',
  phone2: '(202) 876-6037',
  email: 'miki@ymbdetailing.com',
  address: 'Serving DMV area',
  hours: 'Monday - Sunday: 6:00 AM - 8:00 PM',
};
