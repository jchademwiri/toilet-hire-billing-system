import type { invoices as invoicesTable } from '@/lib/mock-data';

// ── Invoice list rollups ─────────────────────────────────────────────────────
// Shared by every screen that totals a set of invoices by gross amount
// (invoice register, statement hub).

export function sumGross(list: (typeof invoicesTable)[number][]) {
  return list.reduce((s, i) => s + i.gross, 0);
}
