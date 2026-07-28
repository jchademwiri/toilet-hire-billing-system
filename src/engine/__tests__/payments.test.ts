import { describe, it, expect } from 'vitest';
import { sumPayments, computeOutstanding } from '../payments';

describe('sumPayments', () => {
  it('returns 0 for an empty list', () => {
    expect(sumPayments([])).toBe(0);
  });

  it('sums a single payment', () => {
    const payments = [{ id: 'p1', invoiceId: 'inv-1', amount: 100.50, receivedAt: '2026-04-15' }];
    expect(sumPayments(payments)).toBe(100.50);
  });

  it('sums multiple payments', () => {
    const payments = [
      { id: 'p1', invoiceId: 'inv-1', amount: 100.00, receivedAt: '2026-04-15' },
      { id: 'p2', invoiceId: 'inv-1', amount: 250.50, receivedAt: '2026-05-01' },
      { id: 'p3', invoiceId: 'inv-1', amount: 49.50, receivedAt: '2026-06-01' },
    ];
    expect(sumPayments(payments)).toBe(400.00);
  });

  it('handles large amounts correctly', () => {
    const payments = [
      { id: 'p1', invoiceId: 'inv-1', amount: 660040.20, receivedAt: '2026-04-15' },
    ];
    expect(sumPayments(payments)).toBe(660040.20);
  });
});

describe('computeOutstanding', () => {
  it('returns gross - paid when partially paid', () => {
    expect(computeOutstanding(1000, 300)).toBe(700);
  });

  it('returns 0 when fully paid', () => {
    expect(computeOutstanding(1000, 1000)).toBe(0);
  });

  it('returns gross when nothing paid', () => {
    expect(computeOutstanding(500, 0)).toBe(500);
  });

  it('returns negative when overpaid', () => {
    expect(computeOutstanding(1000, 1200)).toBe(-200);
  });

  it('handles large invoice amounts', () => {
    expect(computeOutstanding(1011307.70, 660040.20)).toBe(351267.50);
  });
});
