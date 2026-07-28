// ─────────────────────────────────────────────────────────────────────────────
// Server-side PDF generation — programmatic jsPDF rendering for invoices.
//
// This runs exclusively on the server (never in the browser). It produces
// smaller, text-selectable PDFs compared to the client-side html2canvas
// approach, and is ideal for email attachments and bulk generation.
//
// LAYOUT:  Mirrors the Tshwane-approved Excel / React InvoiceDocument layout
//          exactly — header, contact details, bill-to/registration, line-item
//          table, VAT/totals, banking details, signatures, footer.
// ─────────────────────────────────────────────────────────────────────────────

import jsPDF from 'jspdf';
import { readFileSync } from 'fs';
import { join } from 'path';

import { contract } from '@/lib/mock-data';
import { computeAreaLines } from '@/engine/invoice-lines';
import { getAgingBucket, AGING_BUCKETS } from '@/engine/aging';
import type { Allocation, BillingPeriod, Invoice } from '@/engine/lib/schemas';
import { company } from '@/config/company';

// ── Cached image assets (loaded once at module init) ───────────────────────

/** Helper: read an image from public/ and return a data URI, or null on failure. */
function loadPublicImage(relPath: string | undefined): string | null {
  if (!relPath) return null;
  try {
    const buf = readFileSync(join(process.cwd(), 'public', relPath.replace(/^\//, '')));
    return `data:image/png;base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

/** The scanned service-provider signature, shown below banking details. */
const signatureImage = loadPublicImage(
  (company as Record<string, unknown>).signaturePath as string | undefined,
);

/** Company logo shown in the header next to the invoice title. */
const logoImage = loadPublicImage(
  (company as Record<string, unknown>).logoPath as string | undefined,
);

// ── Page constants (mm) ──────────────────────────────────────────────────────

const PAGE = {
  width: 210,
  height: 297,
  margin: 20,    // matches A4Page padding-left/padding-right
  bottom: 282,   // 297 - 15 (A4Page padding-bottom)
} as const;

/** Align right within content area. */
const RIGHT = PAGE.width - PAGE.margin;
const RIGHT_W = 56; // width of right-aligned label block

/** Column positions for the line-items table (mm from left edge). */
const COL = {
  num: PAGE.margin + 2,       // # — row number
  township: PAGE.margin + 10, // Township / informal settlement name
  qty: 85,                    // Quantity of toilets
  days: 97,                   // Days in the billing period
  rental: 108,                // Rental amount (right-aligned)
  services: 140,              // Number of services
  serviceAmt: 150,            // Service amount (right-aligned)
  subtotal: RIGHT - 2,        // Sub total (right-aligned)
} as const;

/** Max width in mm for the township name column before wrapping. */
const COL_TOWNSHIP_W = COL.qty - COL.township - 2; // ~55mm

// ── Currency / date helpers ──────────────────────────────────────────────────

const FMT = {
  date: (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
  },
  zar: (n: number) => `R${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`,
} as const;

// ── Typography helpers ───────────────────────────────────────────────────────

type Doc = jsPDF;

function bold(doc: Doc) { doc.setFont('helvetica', 'bold'); }
function normal(doc: Doc) { doc.setFont('helvetica', 'normal'); }
function fontSize(doc: Doc, pt: number) { doc.setFontSize(pt); }
function textColor(doc: Doc, r: number, g: number, b: number) { doc.setTextColor(r, g, b); }
function fillColor(doc: Doc, r: number, g: number, b: number) { doc.setFillColor(r, g, b); }
function drawColor(doc: Doc, r: number, g: number, b: number) { doc.setDrawColor(r, g, b); }

function ensurePage(doc: Doc, y: number, needed = 16): number {
  if (y + needed <= PAGE.bottom) return y;
  doc.addPage();
  return PAGE.margin;
}

/** Draw a horizontal rule across the page content area. */
function hr(doc: Doc, y: number) {
  doc.line(PAGE.margin, y, PAGE.width - PAGE.margin, y);
}

// ── Section drawers ──────────────────────────────────────────────────────────

function drawHeader(doc: Doc) {
  // Title above company name (left side), matching React InvoiceDocument
  fontSize(doc, 20);
  textColor(doc, 161, 161, 170);
  doc.text('TAX INVOICE', PAGE.margin, 15);

  // Company name below title
  fontSize(doc, 13);
  bold(doc);
  textColor(doc, 24, 24, 27);
  doc.text(company.name.toUpperCase(), PAGE.margin, 22);

  // Logo on the far right, aligned with the title
  if (logoImage) {
    doc.addImage(logoImage, 'PNG', RIGHT - 56, 11, 50, 23);
  }

  // Address lines below company name
  fontSize(doc, 8);
  normal(doc);
  textColor(doc, 82, 82, 91);
  const headerLines = [
    `VAT No: ${contract.vatNumber}`,
    ...contract.addressLines,
  ];
  headerLines.forEach((l, i) => doc.text(l, PAGE.margin, 28 + i * 4));

  drawColor(doc, 229, 231, 235);
  hr(doc, 48);
}

function drawRegistrationAndMeta(
  doc: Doc,
  invoice: Invoice,
  allocation?: Allocation,
  period?: BillingPeriod,
): number {
  let y = 56;

  // ── LEFT: Provider registration info (VAT Number row removed per user request) ──
  fontSize(doc, 7);
  normal(doc);
  textColor(doc, 82, 82, 91);
  const regLabels = ['Vendor No:', 'Reg No:', 'Contract Ref:'];
  const regValues = [contract.vendorNumber, contract.regNo, contract.reference];
  regLabels.forEach((l, i) => doc.text(l, PAGE.margin, y + 5 + i * 5));
  regValues.forEach((v, i) => doc.text(v, PAGE.margin + 32, y + 5 + i * 5));

  // ── RIGHT: Invoice meta — labels + values on same lines ──
  fontSize(doc, 7);
  textColor(doc, 113, 113, 122);
  doc.text('Tax Invoice No:', RIGHT - RIGHT_W, y + 5);
  doc.text('Invoice Date:', RIGHT - RIGHT_W, y + 10);
  doc.text('Service Period:', RIGHT - RIGHT_W, y + 15);
  doc.text('Region:', RIGHT - RIGHT_W, y + 20);

  const periodLabel = period
    ? `${FMT.date(period.periodStart)} To ${FMT.date(period.periodEnd)}`
    : '—';

  fontSize(doc, 8);
  textColor(doc, 39, 39, 42);
  bold(doc);
  doc.text(invoice.invoiceNumber ?? '—', RIGHT, y + 5, { align: 'right' });
  normal(doc);
  doc.text(FMT.date(invoice.invoiceDate), RIGHT, y + 10, { align: 'right' });
  doc.text(periodLabel, RIGHT, y + 15, { align: 'right' });
  doc.text(allocation?.regionName ?? '—', RIGHT, y + 20, { align: 'right' });

  const hrY = 82;
  hr(doc, hrY);
  return hrY + 6;
}

function drawBillTo(doc: Doc, startY: number): number {
  let y = startY;

  // Bill To (left only — registration moved to header area)
  fontSize(doc, 7);
  bold(doc);
  textColor(doc, 113, 113, 122);
  doc.text('BILL TO:', PAGE.margin, y);

  fontSize(doc, 9);
  textColor(doc, 24, 24, 27);
  doc.text(contract.client, PAGE.margin, y + 7);

  fontSize(doc, 7);
  normal(doc);
  textColor(doc, 82, 82, 91);

  let addrY = y + 12;
  contract.clientAddressLines.forEach((line) => {
    doc.text(line, PAGE.margin, addrY);
    addrY += 5;
  });

  doc.text(`VAT Number: ${contract.clientVatNumber}`, PAGE.margin, addrY + 2);
  doc.text(`Tel: ${contract.clientTel}`, PAGE.margin, addrY + 7);

  const endY = addrY + 12;
  hr(doc, endY);
  return endY + 6;
}

function drawLineItems(
  doc: Doc,
  lines: Array<{
    idx: number; name: string; qty: number; days: number;
    rentalAmount: number; services: number; serviceAmount: number; subtotal: number;
  }>,
  startY: number,
): number {
  let y = startY;

  // ── Table header row 1 ──
  fillColor(doc, 249, 250, 251);
  doc.rect(PAGE.margin, y, PAGE.width - PAGE.margin * 2, 12, 'F');

  fontSize(doc, 6);
  bold(doc);
  textColor(doc, 113, 113, 122);
  doc.text('#', COL.num, y + 3);
  doc.text('TOWNSHIP / INFORMAL SETTLEMENT', COL.township, y + 3);
  // RENTALS & RELOCATIONS spans Qty+Days+Rental columns (x=85 to x=140)
  doc.text('RENTALS & RELOCATIONS', 98, y + 3);
  // SERVICE spans Services+Service Amount columns
  doc.text('SERVICE', 153, y + 3);
  doc.text('SUB TOTALS', COL.subtotal, y + 3, { align: 'right' });

  // ── Table header row 2 ──
  fontSize(doc, 5.5);
  const h2y = y + 6;
  doc.text('Qty', COL.qty, h2y);
  doc.text('Days', COL.days, h2y);
  doc.text(`Rental R${contract.rentalRate.toFixed(2)}`, COL.rental, h2y);
  doc.text('Srvcs', COL.services, h2y);
  doc.text(`Service R${contract.serviceRate.toFixed(2)}`, COL.serviceAmt, h2y);

  drawColor(doc, 209, 213, 219);
  doc.rect(PAGE.margin, y, PAGE.width - PAGE.margin * 2, 12, 'S');

  y += 12;

  // ── Body rows ──
  fontSize(doc, 6.5);
  normal(doc);
  textColor(doc, 39, 39, 42);

  for (const line of lines) {
    // Compute row height first (accounts for wrapped township names)
    const nameLines = doc.splitTextToSize(line.name, COL_TOWNSHIP_W);
    const rowH = Math.max(4.5, nameLines.length * 3.5);
    y = ensurePage(doc, y, rowH);

    // # number
    doc.text(String(line.idx), COL.num, y + 3);

    // Township name: wrap if too long for the column
    nameLines.forEach((part: string, i: number) =>
      doc.text(part, COL.township, y + 3 + i * 3.5),
    );

    // Numeric columns
    doc.text(String(line.qty), COL.qty, y + 3);
    doc.text(String(line.days), COL.days, y + 3);
    doc.text(FMT.zar(line.rentalAmount), COL.rental, y + 3);
    doc.text(String(line.services), COL.services, y + 3);
    doc.text(FMT.zar(line.serviceAmount), COL.serviceAmt, y + 3);
    bold(doc);
    doc.text(FMT.zar(line.subtotal), COL.subtotal, y + 3, { align: 'right' });
    normal(doc);

    drawColor(doc, 229, 231, 235);
    hr(doc, y + rowH);
    y += rowH;
  }

  // Sub totals row
  const totalQty = lines.reduce((s, l) => s + l.qty, 0);
  const totalRental = lines.reduce((s, l) => s + l.rentalAmount, 0);
  const totalService = lines.reduce((s, l) => s + l.serviceAmount, 0);

  y = ensurePage(doc, y, 7);
  fillColor(doc, 249, 250, 251);
  doc.rect(PAGE.margin, y, PAGE.width - PAGE.margin * 2, 7, 'F');
  bold(doc);
  fontSize(doc, 6.5);
  textColor(doc, 39, 39, 42);
  doc.text('Sub Totals', COL.num, y + 4);
  doc.text(String(totalQty), COL.qty, y + 4);
  doc.text(FMT.zar(totalRental), COL.rental, y + 4);
  doc.text(FMT.zar(totalService), COL.serviceAmt, y + 4);
  doc.text(FMT.zar(totalRental + totalService), COL.subtotal, y + 4, { align: 'right' });
  drawColor(doc, 209, 213, 219);
  doc.rect(PAGE.margin, y, PAGE.width - PAGE.margin * 2, 7, 'S');
  normal(doc);

  y += 5;
  return y;
}

function drawTotals(
  doc: Doc,
  lines: Array<{ subtotal: number }>,
  startY: number,
): number {
  const subtotal = lines.reduce((s, l) => s + l.subtotal, 0);
  const vat = subtotal * (contract.vatRate / 100);
  const gross = subtotal + vat;

  let y = ensurePage(doc, startY + 4, 16);

  fontSize(doc, 7);
  textColor(doc, 113, 113, 122);
  doc.text(`VAT @ ${contract.vatRate}%`, RIGHT - RIGHT_W, y);
  doc.text(FMT.zar(vat), RIGHT, y, { align: 'right' });

  y += 6;
  fontSize(doc, 9);
  bold(doc);
  textColor(doc, 24, 24, 27);
  doc.text('Gross Total', RIGHT - RIGHT_W, y);
  doc.text(FMT.zar(gross), RIGHT, y, { align: 'right' });

  y += 8;
  return y;
}

function drawBankingAndSignatures(doc: Doc, startY: number, invoiceDate: string) {
  let y = ensurePage(doc, startY, 48);

  hr(doc, y - 4);

  // 2-column layout matching React InvoiceDocument
  const colMid = PAGE.width / 2 + 5;

  // ── Left column: Banking details + provider signature ──
  fontSize(doc, 6);
  bold(doc);
  textColor(doc, 113, 113, 122);
  doc.text('BANKING DETAILS', PAGE.margin, y);

  fontSize(doc, 7);
  normal(doc);
  textColor(doc, 82, 82, 91);
  let ly = y + 4;
  doc.text(`Account Holder: ${company.name}`, PAGE.margin, ly); ly += 3;
  doc.text(`Bank: ${contract.bankName}`, PAGE.margin, ly); ly += 3;
  doc.text(`Account Number: ${contract.accountNumber}`, PAGE.margin, ly); ly += 3;
  doc.text(`Branch Code: ${contract.branchCode}`, PAGE.margin, ly); ly += 5;

  // Provider signature image (matches InvoiceDocument's company.signaturePath)
  if (signatureImage) {
    doc.addImage(signatureImage, 'PNG', PAGE.margin, ly, 48, 14);
    ly += 17;
  }

  fontSize(doc, 7);
  normal(doc);
  textColor(doc, 82, 82, 91);
  doc.text('Service Provider Signature: ____________________', PAGE.margin, ly); ly += 5;
  doc.text(FMT.date(invoiceDate), PAGE.margin, ly); ly += 5;
  doc.text('Date: ____________________', PAGE.margin, ly); ly += 4;
  const leftEnd = ly;

  // ── Right column: Provider sig + client signatures ──
  // CoT signatures expand toward the bottom of the page for comfortable writing
  let ry = y + 4;
  bold(doc);
  textColor(doc, 113, 113, 122);
  doc.text('SERVICE PROVIDER:', colMid, ry); ry += 4;
  normal(doc);
  textColor(doc, 82, 82, 91);
  doc.text('Signature: ____________________', colMid, ry); ry += 5;
  doc.text(FMT.date(invoiceDate), colMid, ry); ry += 5;
  doc.text('Date: ____________________', colMid, ry); ry += 8;

  // City of Tshwane — generous spacing so the official can sign comfortably
  bold(doc);
  textColor(doc, 113, 113, 122);
  doc.text('CITY OF TSHWANE:', colMid, ry); ry += 5;
  normal(doc);
  textColor(doc, 82, 82, 91);
  doc.text('Official: ____________________', colMid, ry); ry += 6;
  doc.text('Signature: ____________________', colMid, ry); ry += 6;
  doc.text('Date: ____________________', colMid, ry); ry += 6;

  return Math.max(leftEnd, ry) + 2;
}

function drawFooter(doc: Doc) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    hr(doc, 285);
    fontSize(doc, 7);
    normal(doc);
    textColor(doc, 113, 113, 122);
    doc.text(contract.email, PAGE.margin, 290);
    doc.text(contract.website, PAGE.width / 2, 290, { align: 'center' });
    doc.text(contract.tel, PAGE.width - PAGE.margin, 290, { align: 'right' });
    doc.text(`Page ${i} of ${pageCount}`, PAGE.width - PAGE.margin, 280, { align: 'right' });
  }
}

// ── Statement-specific drawers ────────────────────────────────────────────────

function drawStatementHeader(doc: Doc, regionName: string) {
  drawHeader(doc);

  // Overlay the statement title and region bar right after the header rule
  fontSize(doc, 20);
  textColor(doc, 161, 161, 170);
  doc.text('PROJECT STATEMENT', PAGE.width - PAGE.margin, 18, { align: 'right' });

  // Region title bar
  fillColor(doc, 249, 250, 251);
  doc.rect(PAGE.margin, 50, PAGE.width - PAGE.margin * 2, 6, 'F');
  drawColor(doc, 229, 231, 235);
  doc.rect(PAGE.margin, 50, PAGE.width - PAGE.margin * 2, 6, 'S');

  fontSize(doc, 8);
  bold(doc);
  textColor(doc, 63, 63, 70);
  doc.text(regionName, PAGE.margin + 2, 55);
  doc.text('PROJECT STATEMENT', PAGE.width - PAGE.margin - 2, 55, { align: 'right' });
}

function drawStatementInfo(
  doc: Doc,
  allocation: { id: string; regionName: string; deliveryDate: string },
  invoices: Array<{ allocationId: string; invoiceDate: string }>,
): number {
  let y = 64;

  const allocInvoices = invoices.filter((i) => i.allocationId === allocation.id);
  const latestDate = allocInvoices[0]?.invoiceDate ?? allocation.deliveryDate;

  fontSize(doc, 8);
  normal(doc);
  textColor(doc, 82, 82, 91);
  doc.text(
    `${contract.client} - ${company.name} - Statement as of ${FMT.date(latestDate)} - ${allocInvoices.length} invoice${allocInvoices.length !== 1 ? 's' : ''} - ${allocation.regionName}`,
    PAGE.margin, y,
  );

  y += 8;
  hr(doc, y);
  return y + 6;
}

function drawStatementTransactions(
  doc: Doc,
  transactions: Array<{ date: string; num: string; label: string; debit: number; credit: number }>,
  startY: number,
): { endY: number; transactions: Array<{ date: string; num: string; label: string; debit: number; credit: number }> } {
  const totalDebit = transactions.reduce((s, t) => s + t.debit, 0);
  const totalCredit = transactions.reduce((s, t) => s + t.credit, 0);

  let y = startY;

  // Table header
  fillColor(doc, 249, 250, 251);
  doc.rect(PAGE.margin, y, PAGE.width - PAGE.margin * 2, 8, 'F');
  fontSize(doc, 6.5);
  bold(doc);
  textColor(doc, 113, 113, 122);
  const colDefs = [
    { label: 'Date', x: PAGE.margin + 2, align: 'left' as const },
    { label: 'Invoice #', x: PAGE.margin + 32, align: 'left' as const },
    { label: 'Description', x: PAGE.margin + 62, align: 'left' as const },
    { label: 'Debit', x: PAGE.width - PAGE.margin - 50, align: 'right' as const },
    { label: 'Credit', x: PAGE.width - PAGE.margin - 2, align: 'right' as const },
  ];
  colDefs.forEach((c) => doc.text(c.label, c.x, y + 5, { align: c.align }));
  drawColor(doc, 209, 213, 219);
  doc.rect(PAGE.margin, y, PAGE.width - PAGE.margin * 2, 8, 'S');
  y += 11;

  // Body rows
  fontSize(doc, 7);
  normal(doc);
  textColor(doc, 39, 39, 42);
  for (const tx of transactions) {
    y = ensurePage(doc, y, 6);
    doc.text(FMT.date(tx.date), PAGE.margin + 2, y + 4);
    doc.text(tx.num, PAGE.margin + 32, y + 4);
    doc.text(tx.label, PAGE.margin + 62, y + 4);
    doc.text(FMT.zar(tx.debit), PAGE.width - PAGE.margin - 2, y + 4, { align: 'right' });
    doc.text(tx.credit > 0 ? FMT.zar(tx.credit) : '-', PAGE.width - PAGE.margin - 50, y + 4, { align: 'right' });
    drawColor(doc, 229, 231, 235);
    hr(doc, y + 5);
    y += 7;
  }

  // Totals row
  y = ensurePage(doc, y, 7);
  fillColor(doc, 249, 250, 251);
  doc.rect(PAGE.margin, y, PAGE.width - PAGE.margin * 2, 7, 'F');
  bold(doc);
  fontSize(doc, 7);
  textColor(doc, 39, 39, 42);
  doc.text('Totals', PAGE.margin + 2, y + 4);
  doc.text(FMT.zar(totalDebit), PAGE.width - PAGE.margin - 2, y + 4, { align: 'right' });
  doc.text(FMT.zar(totalCredit), PAGE.width - PAGE.margin - 50, y + 4, { align: 'right' });
  drawColor(doc, 209, 213, 219);
  doc.rect(PAGE.margin, y, PAGE.width - PAGE.margin * 2, 7, 'S');
  normal(doc);
  y += 12;

  return { endY: y, transactions };
}

function drawStatementAging(doc: Doc, transactions: Array<{ date: string; debit: number; credit: number }>, startY: number): number {
  let y = ensurePage(doc, startY, 30);

  fontSize(doc, 7);
  bold(doc);
  textColor(doc, 63, 63, 70);
  doc.text('AGEING SUMMARY', PAGE.margin, y);
  y += 4;

  const buckets = AGING_BUCKETS as Array<{ key: string; label: string }>;
  const numCols = buckets.length + 1; // aging buckets + total outstanding
  const colWidth = (PAGE.width - PAGE.margin * 2) / numCols;

  // Header row
  fillColor(doc, 249, 250, 251);
  doc.rect(PAGE.margin, y, numCols * colWidth, 7, 'F');
  fontSize(doc, 6);
  bold(doc);
  textColor(doc, 113, 113, 122);
  buckets.forEach((b, i) => {
    doc.text(b.label, PAGE.margin + i * colWidth + colWidth / 2, y + 4, { align: 'center' });
  });
  doc.text('Total Outstanding', PAGE.margin + buckets.length * colWidth + colWidth / 2, y + 4, { align: 'center' });

  drawColor(doc, 209, 213, 219);
  doc.rect(PAGE.margin, y, numCols * colWidth, 7, 'S');
  y += 8;

  // Value row (only outstanding invoices have non-zero aging)
  fontSize(doc, 6.5);
  textColor(doc, 39, 39, 42);

  let grandTotal = 0;
  const values = buckets.map((b) => {
    const total = transactions
      .filter((tx) => getAgingBucket(tx.date, 'OUTSTANDING') === b.key)
      .reduce((s, tx) => s + (tx.debit - tx.credit), 0);
    grandTotal += total;
    return total;
  });
  values.push(Math.abs(grandTotal));

  bold(doc);
  values.forEach((val, i) => {
    const x = PAGE.margin + i * colWidth + colWidth / 2;
    doc.text(val > 0 ? FMT.zar(val) : '-', x, y + 3, { align: 'center' });
  });
  normal(doc);

  drawColor(doc, 209, 213, 219);
  doc.rect(PAGE.margin, y - 8, numCols * colWidth, 14, 'S');
  y += 10;

  return y;
}

function drawStatementBanking(doc: Doc, startY: number): number {
  let y = ensurePage(doc, startY, 24);

  hr(doc, y - 4);
  fontSize(doc, 6.5);
  normal(doc);
  textColor(doc, 82, 82, 91);
  doc.text(`Account Holder: ${company.name}`, PAGE.margin, y);
  doc.text(`Bank: ${contract.bankName}`, PAGE.margin, y + 5);
  doc.text(`Account Number: ${contract.accountNumber}`, PAGE.margin, y + 10);
  doc.text(`Branch Code: ${contract.branchCode}`, PAGE.margin, y + 15);

  return y + 18;
}

// ── Main render function ─────────────────────────────────────────────────────

export interface PdfResult {
  fileName: string;
  buffer: Buffer;
}

export type PdfType = 'invoice' | 'statement';

const SUPPORTED: PdfType[] = ['invoice', 'statement'];

/**
 * Generate a billing PDF from mock data.
 *
 * @param type - Document type ('invoice' | 'statement').
 * @param id - Invoice ID (e.g. 'inv-006') or allocation ID.
 * @returns `{ fileName, buffer }` or `null` if the data is not found.
 */
export async function generateBillingPdf(
  type: PdfType,
  id: string,
): Promise<PdfResult | null> {
  if (!SUPPORTED.includes(type)) return null;

  if (type === 'invoice') return generateInvoicePdf(id);
  if (type === 'statement') return generateStatementPdf(id);

  return null;
}

async function generateInvoicePdf(invoiceId: string): Promise<PdfResult | null> {
  const { invoices, allocations, billingPeriods } = await import('@/lib/mock-data');

  const invoice = invoices.find((i) => i.id === invoiceId);
  if (!invoice) return null;

  const allocation = allocations.find((a) => a.id === invoice.allocationId);
  const period = billingPeriods.find((p) => p.id === invoice.billingPeriodId);

  const lines = computeAreaLines(invoice.allocationId, invoice.billingPeriodId);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  drawHeader(doc);
  const afterReg = drawRegistrationAndMeta(doc, invoice, allocation, period);
  const afterBillTo = drawBillTo(doc, afterReg);
  const afterItems = drawLineItems(doc, lines, afterBillTo);
  const afterTotals = drawTotals(doc, lines, afterItems);
  drawBankingAndSignatures(doc, afterTotals, invoice.invoiceDate);
  drawFooter(doc);

  const fileName = `Invoice-${invoice.invoiceNumber ?? invoice.id}.pdf`
    .replace(/[^a-zA-Z0-9_.-]/g, '-');

  return { fileName, buffer: Buffer.from(doc.output('arraybuffer')) };
}

async function generateStatementPdf(allocationId: string): Promise<PdfResult | null> {
  const { allocations, invoices: allInvoices, payments } = await import('@/lib/mock-data');

  const allocation = allocations.find((a) => a.id === allocationId);
  if (!allocation) return null;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Pre-compute transactions: filter invoices for this allocation, sort descending, enrich with payments
  const allocInvoices = allInvoices
    .filter((i) => i.allocationId === allocationId)
    .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());

  const transactions = allocInvoices.map((inv) => {
    const paid = payments
      .filter((p) => p.invoiceId === inv.id)
      .reduce((s, p) => s + p.amount, 0);
    return {
      date: inv.invoiceDate,
      num: inv.invoiceNumber ?? '-',
      label: `Toilet Hire and Servicing (${inv.billingPeriodLabel})`,
      debit: inv.gross,
      credit: paid,
    };
  });

  drawStatementHeader(doc, allocation.regionName);
  const afterInfo = drawStatementInfo(doc, allocation, allInvoices);
  const { endY } = drawStatementTransactions(doc, transactions, afterInfo);
  const afterAging = drawStatementAging(doc, transactions, endY + 4);
  drawStatementBanking(doc, afterAging + 4);
  drawFooter(doc);

  const fileName = `Statement-${allocation.regionName.replace(/\s+/g, '-')}.pdf`
    .replace(/[^a-zA-Z0-9_.-]/g, '-');

  return { fileName, buffer: Buffer.from(doc.output('arraybuffer')) };
}
