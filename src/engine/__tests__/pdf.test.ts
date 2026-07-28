import { describe, it, expect } from 'vitest';
import { printStyles, bundlePrintStyles, toDMS, generateToiletNumbers, computeServiceDates } from '../pdf';

describe('printStyles', () => {
  it('generates portrait CSS for A4', () => {
    const css = printStyles({ targetId: 'my-doc' });
    expect(css).toContain('size: A4');
    expect(css).toContain('#my-doc');
    expect(css).toContain('@media print');
  });

  it('generates landscape CSS', () => {
    const css = printStyles({ targetId: 'my-doc', orientation: 'landscape' });
    expect(css).toContain('size: A4 landscape');
  });

  it('generates repeated children CSS', () => {
    const css = printStyles({ targetId: 'wrapper', repeatedChildren: true });
    expect(css).toContain('#wrapper > div');
  });
});

describe('bundlePrintStyles', () => {
  it('generates bundle CSS with landscape page rule', () => {
    const css = bundlePrintStyles({ targetId: 'bundle' });
    expect(css).toContain('@page landscape');
    expect(css).toContain('#bundle');
    expect(css).toContain('bundle-page');
  });
});

describe('toDMS', () => {
  it('formats southern hemisphere coordinates correctly', () => {
    const result = toDMS(-25.4020, 28.2940);
    expect(result).toMatch(/25°24'7\.[0-9]+"S/);
    expect(result).toMatch(/28°17'38\.[0-9]+"E/);
  });

  it('formats northern hemisphere coordinates correctly', () => {
    const result = toDMS(40.7128, -74.0060);
    expect(result).toContain('N');
    expect(result).toContain('W');
  });

  it('returns both directions in the string', () => {
    const result = toDMS(-25.4020, 28.2940);
    expect(result).toContain('S');
    expect(result).toContain('E');
    expect(result).toContain('°');
    expect(result).toContain("'");
    expect(result).toContain('"');
  });
});

describe('generateToiletNumbers', () => {
  it('generates the correct count of numbers', () => {
    const nums = generateToiletNumbers('ar-001', 8);
    expect(nums).toHaveLength(8);
  });

  it('starts from the base number for the area', () => {
    const nums = generateToiletNumbers('ar-001', 3);
    expect(nums[0]).toBe(98);
    expect(nums[1]).toBe(99);
    expect(nums[2]).toBe(100);
  });

  it('uses base 1 for unknown area IDs', () => {
    const nums = generateToiletNumbers('unknown', 2);
    expect(nums).toEqual([1, 2]);
  });

  it('handles zero count gracefully', () => {
    const nums = generateToiletNumbers('ar-001', 0);
    expect(nums).toEqual([]);
  });

  it('different areas have different starting numbers', () => {
    const a = generateToiletNumbers('ar-001', 1);
    const b = generateToiletNumbers('ar-002', 1);
    expect(a[0]).not.toBe(b[0]);
  });
});

describe('computeServiceDates', () => {
  it('returns all Monday dates in a given period', () => {
    // July 2026: Jul 1 (Wed) - Jul 25 (Sat)
    // Mondays: Jul 6, 13, 20
    const dates = computeServiceDates('Monday', 'Monday', '2026-07-01', '2026-07-25');
    expect(dates).toHaveLength(3);
    expect(dates[0].date).toBe('2026-07-06');
    expect(dates[1].date).toBe('2026-07-13');
    expect(dates[2].date).toBe('2026-07-20');
  });

  it('handles two different service days', () => {
    // July 2026: Mon + Thu → 8 service dates in Jul 1-25
    // Mon: 6, 13, 20 → 3
    // Thu: 2, 9, 16, 23 → 4
    // Total: 7
    const dates = computeServiceDates('Monday', 'Thursday', '2026-07-01', '2026-07-25');
    expect(dates).toHaveLength(7);
  });

  it('includes day name in each result', () => {
    const dates = computeServiceDates('Monday', 'Thursday', '2026-07-01', '2026-07-25');
    for (const d of dates) {
      expect(d.dayName).toMatch(/^(MONDAY|THURSDAY)$/);
    }
  });

  it('returns empty array for empty period', () => {
    const dates = computeServiceDates('Monday', 'Thursday', '2026-07-25', '2026-07-01');
    expect(dates).toEqual([]);
  });

  it('returns empty array when end equals start but no target day matches', () => {
    // July 5 is a Sunday — no Monday or Thursday
    const dates = computeServiceDates('Monday', 'Thursday', '2026-07-05', '2026-07-05');
    expect(dates).toEqual([]);
  });

  it('includes the end date if it matches a service day', () => {
    // July 25, 2026 is a Saturday — no
    // July 23 is a Thursday
    const dates = computeServiceDates('Thursday', 'Thursday', '2026-07-23', '2026-07-23');
    expect(dates).toHaveLength(1);
    expect(dates[0].date).toBe('2026-07-23');
  });
});
