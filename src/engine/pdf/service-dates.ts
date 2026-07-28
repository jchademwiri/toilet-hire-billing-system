// ─────────────────────────────────────────────────────────────────────────────
// Service date computation — used by the Service Notes document to list
// every actual service date within a billing period.
// ─────────────────────────────────────────────────────────────────────────────

import type { DayOfWeek } from '@/engine/lib/schemas';

/**
 * Maps day names to JS getDay() values for quick lookup.
 * Mon=1, Tue=2, Wed=3, Thu=4, Fri=5 (Sun=0, Sat=6 are not used).
 */
const dayMap: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
  Thursday: 4, Friday: 5, Saturday: 6,
};

/** Reverse mapping: numeric day → uppercase day name. */
const dayNames: Record<number, string> =
  Object.fromEntries(
    Object.entries(dayMap).map(([name, n]) => [n, name.toUpperCase()]),
  );

/** A single service date with its day name. */
export interface ServiceDate {
  date: string;       // YYYY-MM-DD
  dayName: string;    // e.g. "MONDAY"
}

/**
 * Computes every service date within a billing period for a given schedule.
 *
 * @param day1 - First scheduled service day (e.g. 'Monday').
 * @param day2 - Second scheduled service day (e.g. 'Thursday').
 * @param periodStart - Start of billing period (YYYY-MM-DD).
 * @param periodEnd - End of billing period (YYYY-MM-DD).
 * @returns Array of service dates with day names.
 */
export function computeServiceDates(
  day1: DayOfWeek,
  day2: DayOfWeek,
  periodStart: string,
  periodEnd: string,
): ServiceDate[] {
  const targets = [dayMap[day1], dayMap[day2]].filter((d) => d !== undefined);
  if (targets.length === 0) return [];

  const dates: ServiceDate[] = [];
  const cursor = new Date(periodStart);
  const end = new Date(periodEnd);

  while (cursor <= end) {
    if (targets.includes(cursor.getUTCDay())) {
      dates.push({
        date: cursor.toISOString().split('T')[0],
        dayName: dayNames[cursor.getUTCDay()],
      });
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}
