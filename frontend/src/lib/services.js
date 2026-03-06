/**
 * Do not show these services in any service list.
 * maintenance-detailing: legacy slug. fleet-detailing: section removed.
 */
export const HIDDEN_SERVICE_SLUGS = ['maintenance-detailing', 'fleet-detailing'];

export function filterVisibleServices(services) {
  if (!Array.isArray(services)) return [];
  return services.filter((s) => s?.slug && !HIDDEN_SERVICE_SLUGS.includes(s.slug));
}

/**
 * Display name for services. Always show "Full Detailing" for full-detailing
 * (never "In & Out" or "In and out" from API/database).
 */
export function getServiceDisplayName(service) {
  if (!service) return 'Service';
  if (service.slug === 'full-detailing') return 'Full Detailing';
  const n = service.name ?? '';
  if (/in\s*[&]?\s*out/i.test(n)) return 'Full Detailing';
  return n || 'Service';
}
