import type { Payment } from './lib/schemas';

// ── Payment rollups ──────────────────────────────────────────────────────────
// Shared by every screen that shows "paid so far" / "outstanding" for an
// invoice or a list of invoices (invoice detail, statement, payments list).

export function sumPayments(list: Payment[]) {
  return list.reduce((s, p) => s + p.amount, 0);
}

export function computeOutstanding(gross: number, totalPaid: number) {
  return gross - totalPaid;
}
