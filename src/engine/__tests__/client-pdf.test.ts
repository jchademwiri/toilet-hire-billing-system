import { describe, it, expect } from 'vitest';
import {
  sanitizePdfFileName,
  extractPdfBase64,
  PDF_A4,
} from '../pdf/client-pdf';

describe('PDF_A4 constants', () => {
  it('has correct A4 dimensions', () => {
    expect(PDF_A4.widthMm).toBe(210);
    expect(PDF_A4.heightMm).toBe(297);
  });

  it('has canvas scale of 2 for high quality', () => {
    expect(PDF_A4.canvasScale).toBe(2);
  });
});

describe('sanitizePdfFileName', () => {
  it('removes .pdf extension before sanitizing', () => {
    expect(sanitizePdfFileName('Invoice.pdf')).toBe('Invoice.pdf');
  });

  it('replaces spaces with hyphens', () => {
    expect(sanitizePdfFileName('My Invoice')).toBe('My-Invoice.pdf');
  });

  it('removes illegal filename characters', () => {
    expect(sanitizePdfFileName('Invoice: STP-26/0396')).toBe('Invoice-STP-26-0396.pdf');
  });

  it('collapses multiple hyphens', () => {
    expect(sanitizePdfFileName('Invoice---123')).toBe('Invoice-123.pdf');
  });

  it('trims leading and trailing hyphens', () => {
    expect(sanitizePdfFileName('-Invoice-')).toBe('Invoice.pdf');
  });

  it('falls back to "document.pdf" for empty names', () => {
    expect(sanitizePdfFileName('')).toBe('document.pdf');
  });

  it('handles names with special characters', () => {
    expect(sanitizePdfFileName('Invoice #123 <test>')).toBe('Invoice-#123-test.pdf');
  });
});

describe('extractPdfBase64', () => {
  it('extracts base64 from a data URI', () => {
    const result = extractPdfBase64('data:application/pdf;base64,abc123');
    expect(result).toBe('abc123');
  });

  it('throws error for invalid data URI', () => {
    expect(() => extractPdfBase64('no-comma')).toThrow('PDF base64 conversion failed');
  });
});
