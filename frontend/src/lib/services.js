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
