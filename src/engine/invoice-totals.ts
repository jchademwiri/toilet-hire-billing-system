import { contract } from '@/lib/mock-data';
import type { AreaLine } from './invoice-lines';

// ── Rolls per-area lines into an invoice's subtotal/VAT/gross ───────────────
// Used by the Tax Invoice document and the billing hub preview, so the VAT
// formula only exists in one place.

export function computeInvoiceTotals(lines: AreaLine[]) {
  const totalRental = lines.reduce((s, l) => s + l.rentalAmount, 0);
  const totalService = lines.reduce((s, l) => s + l.serviceAmount, 0);
  const subtotal = totalRental + totalService;
  const vat = subtotal * (contract.vatRate / 100);
  const gross = subtotal + vat;
  return { totalRental, totalService, subtotal, vat, gross };
}
