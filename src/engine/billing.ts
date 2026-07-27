import { computeAreaLines } from './invoice-lines';
import { computeInvoiceTotals } from './invoice-totals';

// ── Billing hub preview ──────────────────────────────────────────────────────
// Aggregates computeAreaLines into the single-total shape the billing hub
// shows before an invoice is generated. Built on the same per-area lines as
// the Tax Invoice document, so this and the invoice can never disagree.

export function computeBilling(allocationId: string, periodId: string) {
  const lines = computeAreaLines(allocationId, periodId);
  if (lines.length === 0) return null;

  const totalToilets = lines.reduce((s, l) => s + l.qty, 0);
  const daysInPeriod = lines[0].days;
  const serviceDays = lines[0].services;
  const { totalRental: rentalAmount, totalService: serviceAmount, subtotal, vat, gross } = computeInvoiceTotals(lines);

  return { daysInPeriod, serviceDays, totalToilets, rentalAmount, serviceAmount, subtotal, vat, gross };
}
