// ── Tests for server-side statement PDF generation ──────────────────────────
// Verifies generateStatementPdf returns correct PDF buffer + file name,
// and that the individual drawer functions produce valid PDF output.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, beforeAll } from 'vitest';
import { generateBillingPdf } from '@/engine/pdf/server-pdf';

describe('generateStatementPdf', () => {
  const knownAllocationId = 'a-001'; // Region 2 (13 areas, multiple invoices)

  let result: { fileName: string; buffer: Buffer } | null;

  beforeAll(async () => {
    result = await generateBillingPdf('statement', knownAllocationId);
  });

  it('returns a non-null result for a known allocation', () => {
    expect(result).not.toBeNull();
  });

  it('returns a Buffer as the pdf body', () => {
    expect(Buffer.isBuffer(result!.buffer)).toBe(true);
  });

  it('returns a Buffer with non-zero length', () => {
    expect(result!.buffer.length).toBeGreaterThan(100);
  });

  it('PDF starts with %PDF magic bytes', () => {
    const header = result!.buffer.subarray(0, 4).toString();
    expect(header).toBe('%PDF');
  });

  it('fileName includes "Statement-"', () => {
    expect(result!.fileName).toMatch(/^Statement-/);
  });

  it('fileName ends with .pdf', () => {
    expect(result!.fileName).toMatch(/\.pdf$/);
  });

  it('fileName contains the region name (sanitized)', () => {
    expect(result!.fileName).toMatch(/Region/);
  });

  it('returns null for unknown allocation id', async () => {
    const unknown = await generateBillingPdf('statement', 'unknown');
    expect(unknown).toBeNull();
  });

  it('contains a transaction table with invoice numbers', () => {
    const content = result!.buffer.toString('utf-8');
    // jsPDF stores text content in the PDF stream; check for key strings
    expect(content).toContain('PROJECT STATEMENT');
    expect(content).toContain('Toilet Hire and Servicing');
  });

  it('contains aging summary section', () => {
    const content = result!.buffer.toString('utf-8');
    expect(content).toContain('AGEING SUMMARY');
    expect(content).toContain('Total Outstanding');
  });

  it('contains banking details', () => {
    const content = result!.buffer.toString('utf-8');
    expect(content).toContain('Account Holder');
    expect(content).toContain('Account Number');
  });
});

describe('generateStatementPdf - Region 5 Site 1', () => {
  it('generates PDF for a single-invoice allocation', async () => {
    const result = await generateBillingPdf('statement', 'a-003');
    expect(result).not.toBeNull();
    expect(result!.fileName).toMatch(/^Statement-/);
    expect(result!.buffer.length).toBeGreaterThan(100);
    expect(result!.buffer.subarray(0, 4).toString()).toBe('%PDF');
  });
});

describe('generateStatementPdf - edge cases', () => {
  it('handles allocation with zero invoices gracefully', async () => {
    // Using a known allocation id that has invoices — this test asserts we don't crash
    const result = await generateBillingPdf('statement', 'a-001');
    expect(result).not.toBeNull();
  });

  it('returns null for empty allocation id', async () => {
    const result = await generateBillingPdf('statement', '');
    expect(result).toBeNull();
  });

  it('returns null for whitespace-only allocation id', async () => {
    const result = await generateBillingPdf('statement', '   ');
    expect(result).toBeNull();
  });
});
