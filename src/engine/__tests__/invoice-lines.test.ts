import { describe, it, expect } from 'vitest';
import { computeAreaLines } from '../invoice-lines';

describe('computeAreaLines', () => {
  it('returns 13 lines for Region 2 in July 2026', () => {
    const lines = computeAreaLines('a-001', 'bp-005');
    expect(lines.length).toBe(13);
  });

  it('returns 3 lines for Region 5 (Site 1) in July 2026', () => {
    const lines = computeAreaLines('a-002', 'bp-005');
    expect(lines.length).toBe(3);
  });

  it('returns 2 lines for Region 5 (Leeuwfontein) in July 2026', () => {
    const lines = computeAreaLines('a-003', 'bp-005');
    expect(lines.length).toBe(2);
  });

  it('calculates 25 days for July 2026 period (1 Jul – 25 Jul)', () => {
    const lines = computeAreaLines('a-001', 'bp-005');
    expect(lines[0].days).toBe(25);
  });

  it('calculates rental amount correctly: qty × days × R11.50', () => {
    const lines = computeAreaLines('a-001', 'bp-005');
    const thembaView = lines.find((l) => l.name === 'Themba View Ext 1');
    expect(thembaView).toBeDefined();
    // 8 toilets × 25 days × R11.50 = R2,300.00
    expect(thembaView!.rentalAmount).toBe(8 * 25 * 11.50);
  });

  it('returns a positive service count when a schedule exists', () => {
    const lines = computeAreaLines('a-001', 'bp-005');
    expect(lines[0].services).toBeGreaterThan(0);
  });

  it('calculates service amount correctly: qty × services × R96.50', () => {
    const lines = computeAreaLines('a-001', 'bp-005');
    const thembaView = lines.find((l) => l.name === 'Themba View Ext 1');
    expect(thembaView).toBeDefined();
    expect(thembaView!.serviceAmount).toBe(8 * thembaView!.services * 96.50);
  });

  it('returns subtotal as rental + service amount', () => {
    const lines = computeAreaLines('a-001', 'bp-005');
    for (const line of lines) {
      expect(line.subtotal).toBeCloseTo(line.rentalAmount + line.serviceAmount, 2);
    }
  });

  it('returns empty array for unknown allocation', () => {
    const lines = computeAreaLines('a-unknown', 'bp-005');
    expect(lines).toEqual([]);
  });

  it('returns empty array for unknown period', () => {
    const lines = computeAreaLines('a-001', 'bp-unknown');
    expect(lines).toEqual([]);
  });

  it('uses rowNumber for line item index', () => {
    const lines = computeAreaLines('a-001', 'bp-005');
    // Region 2 areas have rowNumber starting at 1 (skipping 2 and 5)
    const idxValues = lines.map((l) => l.idx).sort((a, b) => a - b);
    expect(idxValues[0]).toBe(1);
    expect(idxValues[idxValues.length - 1]).toBe(15);
  });

  it('Region 5 (Site 1) areas use rowNumber 1-3', () => {
    const lines = computeAreaLines('a-002', 'bp-005');
    expect(lines.map((l) => l.idx)).toEqual([1, 2, 3]);
  });
});
