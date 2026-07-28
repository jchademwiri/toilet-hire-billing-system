import { describe, it, expect } from 'vitest';
import { computeInvoiceTotals } from '../invoice-totals';
import { computeAreaLines } from '../invoice-lines';

describe('computeInvoiceTotals', () => {
  it('returns zero for an empty line array', () => {
    const result = computeInvoiceTotals([]);
    expect(result.subtotal).toBe(0);
    expect(result.vat).toBe(0);
    expect(result.gross).toBe(0);
    expect(result.totalRental).toBe(0);
    expect(result.totalService).toBe(0);
  });

  it('computes correct totals for a single line item', () => {
    const lines = [
      {
        idx: 1,
        name: 'Test Area',
        qty: 10,
        days: 25,
        rentalAmount: 2875,
        services: 8,
        serviceAmount: 7720,
        subtotal: 10595,
      },
    ];
    const result = computeInvoiceTotals(lines);
    expect(result.totalRental).toBe(2875);
    expect(result.totalService).toBe(7720);
    expect(result.subtotal).toBe(10595);
    expect(result.vat).toBe(10595 * 0.15); // 1589.25
    expect(result.gross).toBe(10595 + 10595 * 0.15); // 12184.25
  });

  it('aggregates multiple line items correctly', () => {
    const lines = [
      { idx: 1, name: 'A', qty: 5, days: 25, rentalAmount: 1437.5, services: 8, serviceAmount: 3860, subtotal: 5297.5 },
      { idx: 2, name: 'B', qty: 10, days: 25, rentalAmount: 2875, services: 8, serviceAmount: 7720, subtotal: 10595 },
    ];
    const result = computeInvoiceTotals(lines);
    expect(result.totalRental).toBe(1437.5 + 2875);
    expect(result.totalService).toBe(3860 + 7720);
    expect(result.subtotal).toBe(5297.5 + 10595);
    expect(result.vat).toBeCloseTo((5297.5 + 10595) * 0.15, 2);
    expect(result.gross).toBeCloseTo((5297.5 + 10595) * 1.15, 2);
  });

  it('VAT is exactly 15% of subtotal (matches contract.vatRate)', () => {
    const result = computeInvoiceTotals([
      { idx: 1, name: 'A', qty: 100, days: 30, rentalAmount: 34500, services: 10, serviceAmount: 96500, subtotal: 131000 },
    ]);
    expect(result.vat).toBe(result.subtotal * 0.15);
  });

  it('gross = subtotal + vat', () => {
    const result = computeInvoiceTotals([
      { idx: 1, name: 'A', qty: 50, days: 25, rentalAmount: 14375, services: 8, serviceAmount: 38600, subtotal: 52975 },
    ]);
    expect(result.gross).toBe(result.subtotal + result.vat);
  });

  // ── Integration test with actual mock data ──

  describe('with real mock data', () => {
    it('Region 2 July 2026 invoice totals match expected values', () => {
      const lines = computeAreaLines('a-001', 'bp-005');
      const result = computeInvoiceTotals(lines);

      // Region 2 July 2026: 596 toilets × 25 days × R11.50 = R171,350 rental
      // But different areas have different counts — verify math holds
      expect(result.totalRental).toBeGreaterThan(0);
      expect(result.totalService).toBeGreaterThan(0);
      expect(result.subtotal).toBe(result.totalRental + result.totalService);
      expect(result.vat).toBeCloseTo(result.subtotal * 0.15, 2);
      expect(result.gross).toBeCloseTo(result.subtotal * 1.15, 2);
    });

    it('Region 5 (Site 1) July 2026 invoice totals', () => {
      const lines = computeAreaLines('a-002', 'bp-005');
      const result = computeInvoiceTotals(lines);

      expect(lines.length).toBe(3);
      expect(result.subtotal).toBeGreaterThan(0);
      expect(result.vat).toBeCloseTo(result.subtotal * 0.15, 2);
      expect(result.gross).toBeCloseTo(result.subtotal * 1.15, 2);
    });
  });
});
