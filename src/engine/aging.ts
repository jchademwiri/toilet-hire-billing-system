// ── Accounts-receivable aging ────────────────────────────────────────────────
// Used by the Statement document/list to bucket outstanding invoices by age.

export type AgingBucket = 'current' | '30' | '60' | '90plus';

export const AGING_BUCKETS: { key: AgingBucket; label: string }[] = [
  { key: '90plus', label: '90+ days' },
  { key: '60', label: '61–90 days' },
  { key: '30', label: '31–60 days' },
  { key: 'current', label: 'Current (0–30 days)' },
];

export function getAgingBucket(invoiceDate: string, status: string): AgingBucket {
  if (status !== 'OUTSTANDING') return 'current';

  const today = new Date();
  const issued = new Date(invoiceDate);

  // "Current" always means this calendar month's invoice — not just anything
  // under 30 days old, which would wrongly lump last month's invoice in with
  // this month's whenever the billing date lands late in the month.
  const isCurrentMonth = issued.getUTCFullYear() === today.getUTCFullYear()
    && issued.getUTCMonth() === today.getUTCMonth();
  if (isCurrentMonth) return 'current';

  // Everything else ages by days since the invoice date.
  const days = Math.floor((today.getTime() - issued.getTime()) / 86400000);
  if (days <= 60) return '30';
  if (days <= 90) return '60';
  return '90plus';
}
