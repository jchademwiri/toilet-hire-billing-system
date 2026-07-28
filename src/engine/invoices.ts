import type { Invoice } from './lib/schemas';

// ── Invoice list rollups ─────────────────────────────────────────────────────
// Shared by every screen that totals a set of invoices by gross amount
// (invoice register, statement hub).

export function sumGross(list: Invoice[]) {
  return list.reduce((s, i) => s + i.gross, 0);
}
