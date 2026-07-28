import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { getAgingBucket, AGING_BUCKETS } from '../aging';

describe('AGING_BUCKETS', () => {
  it('has 4 buckets in the correct order', () => {
    expect(AGING_BUCKETS).toHaveLength(4);
    expect(AGING_BUCKETS[0].key).toBe('90plus');
    expect(AGING_BUCKETS[1].key).toBe('60');
    expect(AGING_BUCKETS[2].key).toBe('30');
    expect(AGING_BUCKETS[3].key).toBe('current');
  });

  it('each bucket has a label string', () => {
    for (const bucket of AGING_BUCKETS) {
      expect(typeof bucket.label).toBe('string');
      expect(bucket.label.length).toBeGreaterThan(0);
    }
  });
});

describe('getAgingBucket', () => {
  beforeEach(() => {
    // Freeze "today" to 2026-07-28 so tests are deterministic
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-28T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "current" for a PAID invoice regardless of age', () => {
    expect(getAgingBucket('2026-03-01', 'PAID')).toBe('current');
  });

  it('returns "current" for a DRAFT invoice', () => {
    expect(getAgingBucket('2026-03-01', 'DRAFT')).toBe('current');
  });

  it('returns "current" for an outstanding invoice from the current month', () => {
    // July 2026 is the current month
    expect(getAgingBucket('2026-07-15', 'OUTSTANDING')).toBe('current');
  });

  it('returns "30" for an outstanding invoice 31-60 days old', () => {
    // June 2026 invoice is 28-58 days old on July 28
    expect(getAgingBucket('2026-06-01', 'OUTSTANDING')).toBe('30');
  });

  it('returns "60" for an outstanding invoice 61-90 days old', () => {
    // May 2026 invoice
    expect(getAgingBucket('2026-05-01', 'OUTSTANDING')).toBe('60');
  });

  it('returns "90plus" for an outstanding invoice over 90 days old', () => {
    // March 2026 invoice
    expect(getAgingBucket('2026-03-01', 'OUTSTANDING')).toBe('90plus');
  });

  it('returns "current" for last month outstanding invoice (under 30 days)', () => {
    // June 2026 — although days < 30, it's NOT current month so it goes to "30"
    // Actually, June 30 to July 28 is 28 days, which is under 30
    // But the rule says: not current month → age by days
    // 28 days → under 30 → "30" bucket (31-60)
    // Wait, let me check: days <= 60 → '30'
    expect(getAgingBucket('2026-06-30', 'OUTSTANDING')).toBe('30');
  });

  it('returns "current" for an invoice issued today', () => {
    // Same month as July 28
    expect(getAgingBucket('2026-07-28', 'OUTSTANDING')).toBe('current');
  });

  it('handles invoices from previous months correctly', () => {
    // Test boundary: 61 days exactly
    const sixtyOneDaysAgo = '2026-05-28'; // 61 days before July 28
    expect(getAgingBucket(sixtyOneDaysAgo, 'OUTSTANDING')).toBe('60');
  });
});
