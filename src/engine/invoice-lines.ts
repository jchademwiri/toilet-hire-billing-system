import { billingPeriods, areas, serviceSchedules, contract } from '@/lib/mock-data';

// ── Per-area billing computation ─────────────────────────────────────────────
// The base of every billing calculation in the app: turns an allocation +
// billing period into per-area rental/service line items. Everything else in
// the engine (invoice totals, the billing hub preview) builds on this.

export function computeAreaLines(allocationId: string, periodId: string) {
  const period = billingPeriods.find((p) => p.id === periodId);
  if (!period) return [];

  const allocationAreas = areas.filter((a) => a.allocationId === allocationId);
  const schedule = serviceSchedules.find((s) => s.allocationId === allocationId);

  const start = new Date(period.periodStart);
  const end = new Date(period.periodEnd);
  const daysInPeriod = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;

  const dayMap: Record<string, number> = {
    Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5,
  };
  let serviceDays = 0;
  if (schedule) {
    const targets = new Set([dayMap[schedule.day1], dayMap[schedule.day2]]);
    // periodStart/periodEnd are YYYY-MM-DD, parsed as UTC midnight — use UTC accessors so
    // the weekday count stays correct regardless of the server's local timezone.
    const cursor = new Date(start);
    while (cursor <= end) {
      if (targets.has(cursor.getUTCDay())) serviceDays++;
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  return allocationAreas.map((area, idx) => {
    const rentalAmount = area.toiletCount * daysInPeriod * contract.rentalRate;
    const serviceAmount = area.toiletCount * serviceDays * contract.serviceRate;
    const subtotal = rentalAmount + serviceAmount;
    return {
      idx: area.rowNumber ?? idx + 1,
      name: area.name,
      qty: area.toiletCount,
      days: daysInPeriod,
      rentalAmount,
      services: serviceDays,
      serviceAmount,
      subtotal,
    };
  });
}

export type { AreaLine } from './lib/schemas';
