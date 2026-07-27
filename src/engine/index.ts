// ── The engine ────────────────────────────────────────────────────────────────
// Single home for every billing/financial calculation in the app: per-area
// invoice lines, invoice totals, the billing hub preview, payment rollups,
// and AR aging. Add new calculations here, not inline in a page or document.

export * from './invoice-lines';
export * from './invoice-totals';
export * from './billing';
export * from './payments';
export * from './aging';
export * from './invoices';
