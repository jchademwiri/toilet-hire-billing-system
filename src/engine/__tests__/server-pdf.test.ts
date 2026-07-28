import { describe, it, expect } from 'vitest';
import { generateBillingPdf } from '../pdf/server-pdf';

describe('generateBillingPdf', () => {
  it('returns null for unsupported type', async () => {
    const result = await generateBillingPdf('statement' as any, 'unknown');
    expect(result).toBeNull();
  });

  it('returns null for unknown invoice ID', async () => {
    const result = await generateBillingPdf('invoice', 'unknown');
    expect(result).toBeNull();
  });

  it('generates PDF for a known invoice', async () => {
    const result = await generateBillingPdf('invoice', 'inv-006');
    expect(result).not.toBeNull();
    expect(result!.fileName).toMatch(/\.pdf$/);
    expect(result!.buffer).toBeInstanceOf(Buffer);
    expect(result!.buffer.length).toBeGreaterThan(1000);
  }, 15000);

  it('generates PDF with correct file name', async () => {
    const result = await generateBillingPdf('invoice', 'inv-006');
    expect(result!.fileName).toContain('STP-INV-26-0396');
  }, 15000);

  it('generates PDF that starts with PDF magic bytes', async () => {
    const result = await generateBillingPdf('invoice', 'inv-006');
    // PDF files start with %PDF
    expect(result!.buffer.slice(0, 4).toString()).toBe('%PDF');
  }, 15000);

  it('generates PDF for an outstanding invoice', async () => {
    const result = await generateBillingPdf('invoice', 'inv-001');
    expect(result).not.toBeNull();
    expect(result!.buffer.length).toBeGreaterThan(1000);
  }, 15000);

  it('generates PDF for a paid invoice', async () => {
    const result = await generateBillingPdf('invoice', 'inv-009');
    expect(result).not.toBeNull();
    expect(result!.buffer.length).toBeGreaterThan(1000);
  }, 15000);

  it('Region 2 invoice (13 areas) fits on exactly 1 page', async () => {
    const result = await generateBillingPdf('invoice', 'inv-006');
    const content = result!.buffer.toString('utf-8');

    // PDF structure contains `/Count N` inside the `/Pages` object tree.
    // This is the canonical page count for any compliant PDF.
    const pageMatch = content.match(/\/Count\s+(\d+)/);
    expect(pageMatch).not.toBeNull();
    expect(parseInt(pageMatch![1], 10)).toBe(1);
  }, 15000);

  it('Region 5 invoice (3 areas) fits on exactly 1 page', async () => {
    const result = await generateBillingPdf('invoice', 'inv-007');
    const content = result!.buffer.toString('utf-8');

    const pageMatch = content.match(/\/Count\s+(\d+)/);
    expect(pageMatch).not.toBeNull();
    expect(parseInt(pageMatch![1], 10)).toBe(1);
  }, 15000);

  it('March invoice (PAID) has banking section on the same page as items', async () => {
    const result = await generateBillingPdf('invoice', 'inv-009');
    const content = result!.buffer.toString('utf-8');

    const pageMatch = content.match(/\/Count\s+(\d+)/);
    expect(pageMatch).not.toBeNull();
    expect(parseInt(pageMatch![1], 10)).toBe(1);

    // Verify the banking section is present (not on a separate second page)
    expect(content).toContain('BANKING DETAILS');
    expect(content).toContain('CITY OF TSHWANE');
  }, 15000);
});
