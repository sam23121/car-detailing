/**
 * Central image paths. All assets live in public/images/.
 * New images in public/images/new_images/ used for service/package cards.
 */

const IMAGES_DIR = '/images';
const NEW_IMAGES_DIR = `${IMAGES_DIR}/new_images`;

export const PATHS = {
  // Branding
  logo: `${IMAGES_DIR}/logo.png`,
  logoJpg: `${IMAGES_DIR}/logo.jpg`,
  logoSvg: `${IMAGES_DIR}/logo.svg`,

  // Backgrounds
  homeBg: `${IMAGES_DIR}/home-bg.jpg`,
  heroBg: `${IMAGES_DIR}/hero-bg.png`,
  heroLambergini: `${IMAGES_DIR}/lambergini.jpg`,

  // Service / package imagery (by category)
  cars1: `${IMAGES_DIR}/cars_1.jpg`,
  cars2: `${IMAGES_DIR}/cars_2.jpg`,
  interior1: `${IMAGES_DIR}/interior_1.jpg`,
  interior3: `${IMAGES_DIR}/interior_3.jpg`,
  interior4: `${IMAGES_DIR}/interior_4.jpg`,
  interior5: `${IMAGES_DIR}/interior_5.jpg`,
  interior6: `${IMAGES_DIR}/interior_6.jpg`,
  exterior1: `${IMAGES_DIR}/exterior_1.jpg`,
  exterior2: `${IMAGES_DIR}/exterior_2.jpg`,
  exterior3: `${IMAGES_DIR}/exterior_3.jpg`,
  ceramicCoating: `${IMAGES_DIR}/ceramic_coating.jpg`,
  ceramicCoating2: `${IMAGES_DIR}/ceramic_coating_2.webp`,
  painting: `${IMAGES_DIR}/painting.jpg`,
  painting2: `${IMAGES_DIR}/painting_2.jpg`,
  beforeAfter: `${IMAGES_DIR}/before_and_after.jpg`,
  engineBay: `${IMAGES_DIR}/engine_bay_cleaning.jpg`,
  // Legacy
  fullDetailing: `${IMAGES_DIR}/full_detailing.webp`,
  fullDetailing2: `${IMAGES_DIR}/full_detaling_2.webp`,
  fleetDetailing: `${IMAGES_DIR}/fleet_detailing.webp`,
  maintenance: `${IMAGES_DIR}/maintainence.webp`,
  maintenance2: `${IMAGES_DIR}/maintainence_2.webp`,
  steps2: `${IMAGES_DIR}/steps_2.png`,

  // New images (public/images/new_images/)
  newFullDetailingLevel1: `${NEW_IMAGES_DIR}/Full_detailing_level_1.jpg`,
  newFullDetailingLevel2: `${NEW_IMAGES_DIR}/Full_detailing_level_2.jpg`,
  newFullDetailingLevel3: `${NEW_IMAGES_DIR}/Full_detailing_on_the_outside.jpg`,
  newInteriorLevel2: `${NEW_IMAGES_DIR}/Interior_detaling_level_2.jpg`,
  newMonthlyMaintenance: `${NEW_IMAGES_DIR}/Monthly_maintenance.jpg`,
  newBiweeklyMaintenance: `${NEW_IMAGES_DIR}/Biweekly%20package_pic_(monthly_maintenance).jpg`,
  newCeramic1Year: `${NEW_IMAGES_DIR}/1_year_ceramic_coating.jpg`,
  newCeramic2: `${NEW_IMAGES_DIR}/Ceramic_coating_2.jpg`,
  newPaintCorrection1: `${NEW_IMAGES_DIR}/Paint_correction_1.jpg`,
  newPaintCorrection2: `${NEW_IMAGES_DIR}/Paint_correction_2.jpg`,
};

/** Default when no image is set (e.g. service/package has no image_url). */
export const PLACEHOLDER_IMAGE = PATHS.homeBg;

/**
 * Default image for a service by slug (when service.image_url is null).
 */
export function getServiceImagePath(serviceSlug) {
  const map = {
    'full-detailing': PATHS.newFullDetailingLevel1,
    'exterior-detailing': PATHS.exterior1,
    'interior-detailing': PATHS.interior1,
    'monthly-maintenance': PATHS.newMonthlyMaintenance,
    'paint-correction': PATHS.newPaintCorrection1,
    'ceramic-coating': PATHS.newCeramic1Year,
    'fleet-detailing': PATHS.fleetDetailing,
  };
  return map[serviceSlug] || PLACEHOLDER_IMAGE;
}

/**
 * Default image for a package (by service slug and optional display_order).
 * Uses new_images/ where available.
 */
export function getPackageImagePath(serviceSlug, displayOrder = 0) {
  const byService = {
    'full-detailing': [PATHS.newFullDetailingLevel1, PATHS.newFullDetailingLevel2, PATHS.newFullDetailingLevel3],
    'exterior-detailing': [PATHS.exterior1, PATHS.exterior2, PATHS.exterior3],
    'interior-detailing': [PATHS.interior1, PATHS.newInteriorLevel2, PATHS.interior4],
    'monthly-maintenance': [PATHS.newBiweeklyMaintenance, PATHS.newMonthlyMaintenance],
    'paint-correction': [PATHS.newPaintCorrection1, PATHS.newPaintCorrection2],
    'ceramic-coating': [PATHS.newCeramic1Year, PATHS.newCeramic2, PATHS.newCeramic2],
    'fleet-detailing': [PATHS.fleetDetailing],
  };
  const list = byService[serviceSlug];
  if (!list || list.length === 0) return getServiceImagePath(serviceSlug);
  return list[displayOrder % list.length] || list[0];
}

/** Only use API image_url if it's a local path (avoids broken external URLs). */
function isLocalImageUrl(url) {
  return typeof url === 'string' && url.startsWith('/') && !url.startsWith('//');
}

/**
 * Resolve image src for a service (API image_url or fallback).
 */
export function resolveServiceImage(service, fallback = PLACEHOLDER_IMAGE) {
  if (service?.image_url && isLocalImageUrl(service.image_url)) return service.image_url;
  if (service?.slug) return getServiceImagePath(service.slug);
  return fallback;
}

/**
 * Resolve image src for a package (package image_url, then service, then fallback by slug/order).
 */
export function resolvePackageImage(pkg, service, fallback = PLACEHOLDER_IMAGE) {
  if (pkg?.image_url && isLocalImageUrl(pkg.image_url)) return pkg.image_url;
  if (service?.image_url && isLocalImageUrl(service.image_url)) return service.image_url;
  if (service?.slug != null) return getPackageImagePath(service.slug, pkg?.display_order ?? 0);
  return fallback;
}
