/**
 * Backend API base URL for all frontend requests.
 * Set VITE_API_URL in frontend/.env (or Vercel env vars) to override.
 * No trailing slash. Default http for local dev (backend usually has no SSL).
 */
export const API_BASE =
   import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:8000';

/**
 * Business contact info – change here to update everywhere (Contact, Footer, etc.).
 * For phone use digits only or format like (410) 575-4616; tel: links work with both.
 */
export const BUSINESS = {
  phone: '(410) ###-####',
  email: 'smlalene@gmail.com',
  address: '911 Autumn Valley Ln, Gambrills, MD 21054',
  hours: 'Monday - Sunday: 6:00 AM - 8:00 PM',
};
