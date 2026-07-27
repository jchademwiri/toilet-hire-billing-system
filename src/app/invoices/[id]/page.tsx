import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  invoices, payments, billingPeriods, allocations, areas, serviceSchedules, contract,
  fmt, fmtDate,
} from '@/lib/mock-data';
import { company } from '@/config/company';
import Image from 'next/image';
import PrintButton from '@/components/PrintButton';
import DocumentSidebar from '@/components/DocumentSidebar';
import { ArrowLeft, CheckCircle2, AlertCircle, Clock, RefreshCw } from 'lucide-react';

// ── Per-area billing computation ─────────────────────────────────────────────

export function computeAreaLines(allocationId: string, periodId: string) {
  const period = billingPeriods.find((p) => p.id === periodId);
  if (!period) return [];

  const allocationAreas = areas.filter((a) => a.allocationId === allocationId);
  const schedule = serviceSchedules.find((s) => s.allocationId === allocationId);

  const start = new Date(period.periodStart);
  const end = new Date(period.periodEnd);
  const daysInPeriod = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;

  const dayMap: Record<string, number> = {
    Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5,
  };
  let serviceDays = 0;
  if (schedule) {
    const targets = new Set([dayMap[schedule.day1], dayMap[schedule.day2]]);
    const cursor = new Date(start);
    while (cursor <= end) {
      if (targets.has(cursor.getDay())) serviceDays++;
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return allocationAreas.map((area, idx) => {
    const rentalAmount = area.toiletCount * daysInPeriod * contract.rentalRate;
    const serviceAmount = area.toiletCount * serviceDays * contract.serviceRate;
    const subtotal = rentalAmount + serviceAmount;
    return {
      idx: area.rowNumber ?? idx + 1,
      name: area.name,
      qty: area.toiletCount,
      days: daysInPeriod,
      rentalAmount,
      services: serviceDays,
      serviceAmount,
      subtotal,
    };
  });
}

// ── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === 'PAID') return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
      <CheckCircle2 className="w-4 h-4" />Paid
    </span>
  );
  if (status === 'OUTSTANDING') return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
      <AlertCircle className="w-4 h-4" />Outstanding
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
      <Clock className="w-4 h-4" />Draft
    </span>
  );
}

// ── Invoice Document (A4 preview) ────────────────────────────────────────────

export function InvoiceDocument({
  invoice,
  allocation,
  period,
  lines,
}: {
  invoice: typeof invoices[number];
  allocation: typeof allocations[number] | undefined;
  period: typeof billingPeriods[number] | undefined;
  lines: ReturnType<typeof computeAreaLines>;
}) {
  const totalRental = lines.reduce((s, l) => s + l.rentalAmount, 0);
  const totalService = lines.reduce((s, l) => s + l.serviceAmount, 0);
  const subtotal = totalRental + totalService;
  const vat = subtotal * (contract.vatRate / 100);
  const gross = subtotal + vat;

  return (
    <div
      id="invoice-document"
      className="bg-white text-zinc-900 shadow-xl mx-auto"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '15mm 20mm',
        fontFamily: 'var(--font-inter), Arial, sans-serif',
        fontSize: '9pt',
        lineHeight: '1.5',
      }}
    >
      {/* ── Letterhead ── */}
      <div className="flex justify-between items-start pb-3 mb-3">
        <div className="text-xs text-zinc-700 leading-snug">
          <p className="text-sm font-bold text-zinc-900">TAX INVOICE</p>
          <p className="font-semibold text-zinc-900 mt-1">{company.name.toUpperCase()}</p>
          <p>VAT No: {contract.vatNumber}</p>
          {contract.addressLines.map((line) => <p key={line}>{line}</p>)}
        </div>
        <Image
          src={company.logoPath}
          alt={company.shortName}
          width={110}
          height={50}
          className="object-contain shrink-0"
          priority
        />
      </div>

      {/* ── Branded title bar ── */}
      <div className="flex justify-between items-center bg-zinc-900 text-white px-4 py-2 mb-3">
        <h1 className="text-sm font-bold tracking-wide">{company.name.toUpperCase()}</h1>
        <p className="text-sm font-bold">Tax Invoice</p>
      </div>

      {/* ── Contact + invoice meta row ── */}
      <div className="flex justify-between items-start text-xs mb-4">
        <div className="text-zinc-700 leading-snug">
          <p>Tel: {contract.tel} &nbsp;|&nbsp; Cell: {contract.cell} &nbsp;|&nbsp; Fax: {contract.fax}</p>
          <p>Email: {contract.email} &nbsp;|&nbsp; {contract.emailAlt}</p>
          <p>VAT Number: {contract.vatNumber} &nbsp;|&nbsp; Vendor No: {contract.vendorNumber}</p>
          <p>Reg No: {contract.regNo} &nbsp;|&nbsp; {contract.website}</p>
          <p>Contract Ref: {contract.reference}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5">
            <span className="text-zinc-500">Tax Invoice No:</span>
            <span className="font-semibold">{invoice.invoiceNumber ?? '—'}</span>
            <span className="text-zinc-500">Invoice Date:</span>
            <span>{fmtDate(invoice.invoiceDate)}</span>
            <span className="text-zinc-500">Service Period:</span>
            <span>{period ? `${fmtDate(period.periodStart)} To ${fmtDate(period.periodEnd)}` : '—'}</span>
            <span className="text-zinc-500">Region:</span>
            <span>{allocation?.regionName ?? '—'}</span>
          </div>
        </div>
      </div>

      {/* ── Bill to ── */}
      <div className="text-xs text-zinc-700 leading-snug mb-6">
        <p className="font-bold text-zinc-900">BILL TO:</p>
        <p>{company.client}</p>
        {contract.clientAddressLines.map((line) => <p key={line}>{line}</p>)}
        <p className="mt-1">VAT Number: {contract.clientVatNumber}</p>
        <p>Tel: {contract.clientTel}</p>
      </div>

      {/* ── Per-area breakdown table ── */}
      <table className="w-full text-xs border-collapse mb-4">
        <thead>
          <tr className="bg-zinc-100">
            <th rowSpan={2} className="text-left py-1.5 px-2 font-semibold border border-zinc-300 align-bottom">#</th>
            <th rowSpan={2} className="text-left py-1.5 px-2 font-semibold border border-zinc-300 align-bottom">
              TOWNSHIP / INFORMAL SETTLEMENT
            </th>
            <th colSpan={3} className="text-center py-1 px-2 font-semibold border border-zinc-300">
              RENTALS &amp; RELOCATIONS
            </th>
            <th colSpan={2} className="text-center py-1 px-2 font-semibold border border-zinc-300">SERVICE</th>
            <th rowSpan={2} className="text-right py-1.5 px-2 font-semibold border border-zinc-300 align-bottom">
              SUB TOTALS
            </th>
          </tr>
          <tr className="bg-zinc-100">
            <th className="text-right py-1 px-2 font-medium border border-zinc-300">Qty (Units)</th>
            <th className="text-right py-1 px-2 font-medium border border-zinc-300">Days in Period</th>
            <th className="text-right py-1 px-2 font-medium border border-zinc-300">
              Rental Amount R{contract.rentalRate.toFixed(2)}
            </th>
            <th className="text-right py-1 px-2 font-medium border border-zinc-300">No of Services</th>
            <th className="text-right py-1 px-2 font-medium border border-zinc-300">
              Service Amount R{contract.serviceRate.toFixed(2)}
            </th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.idx}>
              <td className="py-1 px-2 border border-zinc-200 text-zinc-600">{line.idx}</td>
              <td className="py-1 px-2 border border-zinc-200">{line.name}</td>
              <td className="py-1 px-2 border border-zinc-200 text-right">{line.qty}</td>
              <td className="py-1 px-2 border border-zinc-200 text-right">{line.days}</td>
              <td className="py-1 px-2 border border-zinc-200 text-right">{fmt(line.rentalAmount)}</td>
              <td className="py-1 px-2 border border-zinc-200 text-right">{line.services}</td>
              <td className="py-1 px-2 border border-zinc-200 text-right">{fmt(line.serviceAmount)}</td>
              <td className="py-1 px-2 border border-zinc-200 text-right font-medium">{fmt(line.subtotal)}</td>
            </tr>
          ))}
          <tr className="bg-zinc-100 font-semibold">
            <td colSpan={2} className="py-1.5 px-2 border border-zinc-300">Sub Totals</td>
            <td className="py-1.5 px-2 border border-zinc-300 text-right">
              {lines.reduce((s, l) => s + l.qty, 0)}
            </td>
            <td className="py-1.5 px-2 border border-zinc-300" />
            <td className="py-1.5 px-2 border border-zinc-300 text-right">{fmt(totalRental)}</td>
            <td className="py-1.5 px-2 border border-zinc-300" />
            <td className="py-1.5 px-2 border border-zinc-300 text-right">{fmt(totalService)}</td>
            <td className="py-1.5 px-2 border border-zinc-300 text-right">{fmt(subtotal)}</td>
          </tr>
        </tbody>
      </table>

      {/* ── Totals ── */}
      <div className="flex justify-end mb-8">
        <table className="text-xs w-72">
          <tbody>
            <tr>
              <td className="py-1.5 pr-4 text-zinc-600">VAT @ {contract.vatRate}%</td>
              <td className="py-1.5 text-right font-medium">{fmt(vat)}</td>
            </tr>
            <tr className="bg-amber-500/90 text-white">
              <td className="py-2 pr-4 font-bold">Gross Total</td>
              <td className="py-2 text-right font-bold">{fmt(gross)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Banking details + signatures ── */}
      <div className="grid grid-cols-2 gap-8 text-xs">
        <div>
          <p className="font-bold text-zinc-900 mb-1">BANKING DETAILS</p>
          <p>Account Holder: {company.name}</p>
          <p>Bank: {contract.bankName}</p>
          <p>Account Number: {contract.accountNumber}</p>
          <p>Branch Code: {contract.branchCode}</p>

          <div className="mt-8">
            <Image
              src={company.signaturePath}
              alt="Signature"
              width={110}
              height={38}
              className="object-contain"
              priority
            />
            <p className="border-t border-zinc-400 pt-0.5 mt-1">Service Provider Signature:</p>
            <p className="mt-3">{fmtDate(invoice.invoiceDate)}</p>
            <p className="border-t border-zinc-400 pt-0.5 mt-1">Date:</p>
          </div>
        </div>
        <div>
          <div className="mt-8">
            <p className="border-t border-zinc-400 pt-0.5 mt-10">City of Tshwane Official:</p>
            <p className="border-t border-zinc-400 pt-0.5 mt-8">Signature:</p>
            <p className="border-t border-zinc-400 pt-0.5 mt-8">Date:</p>
          </div>
        </div>
      </div>

      {/* ── Footer contact bar ── */}
      <div className="mt-10 pt-2 border-t border-zinc-300 text-[10px] text-zinc-500 flex justify-between">
        <span>{contract.email}</span>
        <span>{contract.website}</span>
        <span>{contract.tel}</span>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = invoices.find((i) => i.id === id);
  if (!invoice) notFound();

  const period = billingPeriods.find((p) => p.id === invoice.billingPeriodId);
  const allocation = allocations.find((a) => a.id === invoice.allocationId);
  const invoicePayments = payments.filter((p) => p.invoiceId === id);
  const totalPaid = invoicePayments.reduce((s, p) => s + p.amount, 0);
  const outstanding = invoice.gross - totalPaid;

  const lines = computeAreaLines(invoice.allocationId, invoice.billingPeriodId);

  // Collect invoice IDs for this allocation (for the sidebar invoice links)
  const allocationInvoiceIds = invoices
    .filter((i) => i.allocationId === invoice.allocationId)
    .map((i) => i.id);

  return (
    <main className="flex-1 p-4 md:p-8">
      {/* ── Toolbar ── */}
      <div className="max-w-[210mm] mx-auto mb-4 flex items-center justify-between">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Invoices
        </Link>
        <div className="flex items-center gap-3">
          <StatusBadge status={invoice.paymentStatus} />
          <PrintButton />
        </div>
      </div>

      {/* ── Two-column layout: A4 document + sidebar ── */}
      <div className="flex gap-6 items-start justify-center">
        {/* Left: A4 Document Preview */}
        <div className="shrink-0">
          <InvoiceDocument
            invoice={invoice}
            allocation={allocation}
            period={period}
            lines={lines}
          />
        </div>

        {/* Right: Document sidebar + metadata (hidden when printing) */}
        <div className="w-72 space-y-4 print:hidden shrink-0">
          {/* Document navigation */}
          <DocumentSidebar
            allocationId={invoice.allocationId}
            activeInvoiceId={id}
            allocationInvoiceIds={allocationInvoiceIds}
          />

          {/* Sage sync */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h2 className="text-xs font-semibold text-foreground flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
              Sage sync
            </h2>
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Invoice number</label>
                <input
                  defaultValue={invoice.invoiceNumber ?? ''}
                  placeholder="Enter Sage invoice number…"
                  className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button className="px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/80 transition shrink-0">
                Save
              </button>
            </div>
            {invoice.sageSyncedAt ? (
              <p className="text-xs text-green-600 dark:text-green-400">Synced {fmtDate(invoice.sageSyncedAt.split('T')[0])}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Not synced to Sage.</p>
            )}
          </div>

          {/* Payments */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-xs font-semibold text-foreground">Payments received</h2>
              <button className="text-xs text-muted-foreground hover:text-foreground transition">+ Add</button>
            </div>
            {invoicePayments.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-muted-foreground">No payments recorded.</div>
            ) : (
              <div className="divide-y divide-border">
                {invoicePayments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">{fmtDate(p.receivedAt)}</span>
                    <span className="text-xs font-medium text-foreground">{fmt(p.amount)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">Outstanding</span>
              <span className={`text-sm font-bold ${outstanding > 0 ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
                {fmt(Math.max(outstanding, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Print styles ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 0; size: A4; }
          html, body { background: white !important; margin: 0 !important; padding: 0 !important; }
          body * { visibility: hidden; }
          #invoice-document, #invoice-document * { visibility: visible; }
          #invoice-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            box-shadow: none !important;
            padding: 15mm 20mm !important;
          }
        }
      `}} />
    </main>
  );
}
