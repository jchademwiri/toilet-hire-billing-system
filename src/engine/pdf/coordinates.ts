// ─────────────────────────────────────────────────────────────────────────────
// GPS coordinate utilities used by the Coordinates Document.
// Extracted from the React component so they can be tested and reused.
// ─────────────────────────────────────────────────────────────────────────────

/** Converts decimal degrees to Degrees-Minutes-Seconds format.
 *
 *  Example:  toDMS(-25.4020, 28.2940)  →  "25°24'7.2\"S 28°17'38.4\"E"
 */
export function toDMS(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  const absLat = Math.abs(lat);
  const absLng = Math.abs(lng);

  const latDeg = Math.floor(absLat);
  const latMin = Math.floor((absLat - latDeg) * 60);
  const latSec = ((absLat - latDeg - latMin / 60) * 3600).toFixed(1);

  const lngDeg = Math.floor(absLng);
  const lngMin = Math.floor((absLng - lngDeg) * 60);
  const lngSec = ((absLng - lngDeg - lngMin / 60) * 3600).toFixed(1);

  return `${latDeg}°${latMin}'${latSec}"${latDir} ${lngDeg}°${lngMin}'${lngSec}"${lngDir}`;
}

/** Generates realistic-looking sequential toilet numbers for a given area.
 *
 *  Each area ID maps to a base number offset so the numbers look like
 *  real-world asset tags rather than starting at 1 every time.
 */
export function generateToiletNumbers(
  areaId: string,
  count: number,
): number[] {
  const bases: Record<string, number> = {
    'ar-001': 98,
    'ar-002': 106,
    'ar-003': 114,
    'ar-004': 144,
    'ar-005': 304,
    'ar-006': 354,
    'ar-007': 414,
    'ar-008': 424,
    'ar-009': 464,
    'ar-010': 467,
    'ar-011': 537,
    'ar-012': 617,
    'ar-013': 676,
    'ar-014': 484,
    'ar-015': 507,
    'ar-016': 508,
    'ar-017': 651,
    'ar-018': 661,
  };
  const base = bases[areaId] ?? 1;
  return Array.from({ length: count }, (_, i) => base + i);
}
