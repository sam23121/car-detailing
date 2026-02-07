/**
 * Backend API base URL for all frontend requests.
 * Set VITE_API_URL in frontend/.env to override (e.g. for production).
 * No trailing slash.
 */
export const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:8000';
