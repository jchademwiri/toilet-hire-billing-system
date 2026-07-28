// ─────────────────────────────────────────────────────────────────────────────
// Client-side PDF generation — captures A4 DOM elements as real PDF files
// using html2canvas-pro + jsPDF.
//
// This mirrors the pmg-hub pdf-export.ts approach:
//   1. html2canvas-pro snaps a DOM element to a high-res canvas (2x scale)
//   2. jsPDF renders the canvas image onto A4 pages
//   3. If content overflows A4 height, additional pages are auto-created
//   4. The resulting PDF is downloadable or convertible to base64
// ─────────────────────────────────────────────────────────────────────────────

'use client';

/** A4 page dimensions in mm */
export const PDF_A4 = {
  widthMm: 210,
  heightMm: 297,
  /** When content is just slightly taller than A4, clamp it to fit */
  minorOverflowHeightMm: 315,
  /** Minimum leftover space before we add a new page */
  trailingPageThresholdMm: 10,
  /** Render at 2x for crisp text and borders */
  canvasScale: 2,
  backgroundColor: '#ffffff',
} as const;

// ── Element lookup ───────────────────────────────────────────────────────────

export function getPrintableElementById(elementId: string): HTMLElement {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Printable element '#${elementId}' not found.`);
  }
  return element;
}

// ── File name sanitisation ───────────────────────────────────────────────────

export function sanitizePdfFileName(fileName: string): string {
  const cleaned = fileName
    .replace(/\.pdf$/i, '')
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${cleaned || 'document'}.pdf`;
}

// ── Base64 helpers ───────────────────────────────────────────────────────────

export function extractPdfBase64(dataUri: string): string {
  const base64 = dataUri.split(',')[1];
  if (!base64) throw new Error('PDF base64 conversion failed.');
  return base64;
}

// ── Canvas-to-PDF rendering ──────────────────────────────────────────────────

/**
 * Renders a single canvas onto one or more A4 pages, adding page breaks when
 * content exceeds a single page.
 */
function addCanvasImageToPdf(
  pdf: import('jspdf').jsPDF,
  canvas: HTMLCanvasElement,
) {
  const imgData = canvas.toDataURL('image/png');
  let imgHeight = (canvas.height * PDF_A4.widthMm) / canvas.width;

  // Clamp minor overflows to fit one page
  if (imgHeight > PDF_A4.heightMm && imgHeight < PDF_A4.minorOverflowHeightMm) {
    imgHeight = PDF_A4.heightMm;
  }

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, PDF_A4.widthMm, imgHeight, undefined, 'FAST');
  heightLeft -= PDF_A4.heightMm;

  while (heightLeft > PDF_A4.trailingPageThresholdMm) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, PDF_A4.widthMm, imgHeight, undefined, 'FAST');
    heightLeft -= PDF_A4.heightMm;
  }
}

// ── Single element → PDF ─────────────────────────────────────────────────────

/**
 * Captures a single DOM element and returns a jsPDF instance.
 * Useful when you want to append more content before saving.
 */
export async function renderElementToPdf(
  elementId: string,
): Promise<import('jspdf').jsPDF> {
  const [{ jsPDF }, html2canvas] = await Promise.all([
    import('jspdf'),
    import('html2canvas-pro'),
  ]);

  const element = getPrintableElementById(elementId);
  const canvas = await html2canvas.default(element, {
    scale: PDF_A4.canvasScale,
    useCORS: true,
    logging: false,
    backgroundColor: PDF_A4.backgroundColor,
  });

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  addCanvasImageToPdf(pdf, canvas);
  return pdf;
}

/**
 * Appends an additional element as a new page (or same page) to an existing PDF.
 */
export async function appendElementToPdf(
  pdf: import('jspdf').jsPDF,
  elementId: string,
  shouldAddPage: boolean,
) {
  const html2canvas = (await import('html2canvas-pro')).default;
  const element = getPrintableElementById(elementId);

  const canvas = await html2canvas(element, {
    scale: PDF_A4.canvasScale,
    useCORS: true,
    logging: false,
    backgroundColor: PDF_A4.backgroundColor,
  });

  if (shouldAddPage) pdf.addPage();
  addCanvasImageToPdf(pdf, canvas);
}

// ── Download ─────────────────────────────────────────────────────────────────

/**
 * Captures a DOM element and downloads it as a PDF file.
 * This is the main entry point for client-side PDF export.
 */
export async function downloadElementPdf(elementId: string, fileName: string) {
  const pdf = await renderElementToPdf(elementId);
  pdf.save(sanitizePdfFileName(fileName));
}

// ── Base64 (for email attachments) ───────────────────────────────────────────

/**
 * Captures a DOM element and returns the PDF as a base64 data URI string.
 */
export async function elementToPdfBase64(
  elementId: string,
): Promise<string> {
  const pdf = await renderElementToPdf(elementId);
  return extractPdfBase64(pdf.output('datauristring'));
}

// ── Server-side download (proxied through API route) ─────────────────────────

/**
 * Downloads a PDF generated by the server API route and saves it as a file.
 */
export async function downloadServerPdf(pdfUrl: string, fileName: string) {
  const response = await fetch(pdfUrl, { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error(`PDF download failed (${response.status}).`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = sanitizePdfFileName(fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Fetches a server-generated PDF and returns it as a base64 string.
 */
export async function serverPdfUrlToBase64(pdfUrl: string): Promise<string> {
  const response = await fetch(pdfUrl, { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error(`PDF generation failed (${response.status}).`);
  }

  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }

  return window.btoa(binary);
}
