// ── PDF engine — reusable utilities for printable documents ──────────────────
// Pure functions (no React dependency) that prepare data for every document
// type in the billing system. The React components in components/documents/
// consume these functions and add the layout/JSX layer.
//
// Client-side PDF generation (html2canvas-pro + jsPDF) lives in client-pdf.ts
// and is imported directly by ExportPdfButton — it's 'use client' code.
// The exports below are shared by both client and server paths.

export { printStyles, bundlePrintStyles } from './print-styles';
export type { ServiceDate } from './service-dates';

export { toDMS, generateToiletNumbers } from './coordinates';
export { computeServiceDates } from './service-dates';

// Client-side PDF generation helpers (fetched dynamically at runtime)
export {
  getPrintableElementById,
  sanitizePdfFileName,
  extractPdfBase64,
  renderElementToPdf,
  appendElementToPdf,
  downloadElementPdf,
  elementToPdfBase64,
  downloadServerPdf,
  serverPdfUrlToBase64,
  PDF_A4,
} from './client-pdf';
