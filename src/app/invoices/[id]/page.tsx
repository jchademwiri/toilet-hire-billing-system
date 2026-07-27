import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  invoices, payments, billingPeriods, allocations, fmt, fmtDate,
} from '@/lib/mock-data';
import PrintButton from '@/components/PrintButton';
import DocumentSidebar from '@/components/DocumentSidebar';
import { ArrowLeft, CheckCircle2, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { computeAreaLines } from '@/lib/invoice-lines';
import { InvoiceDocument } from '@/components/documents/InvoiceDocument';

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
      <div className="max-w-[210mm] mx-auto mb-4 flex items-center justify-between print:hidden">
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
