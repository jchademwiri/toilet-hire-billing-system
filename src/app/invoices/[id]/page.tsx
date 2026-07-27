import Link from 'next/link';
import { notFound } from 'next/navigation';
import { invoices, payments, billingPeriods, allocations, fmt, fmtDate } from '@/lib/mock-data';
import { ArrowLeft, CheckCircle2, AlertCircle, Clock, FileText, RefreshCw } from 'lucide-react';

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

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = invoices.find((i) => i.id === id);
  if (!invoice) notFound();

  const period = billingPeriods.find((p) => p.id === invoice.billingPeriodId);
  const allocation = allocations.find((a) => a.id === invoice.allocationId);
  const invoicePayments = payments.filter((p) => p.invoiceId === id);
  const totalPaid = invoicePayments.reduce((s, p) => s + p.amount, 0);
  const outstanding = invoice.gross - totalPaid;

  return (
    <main className="flex-1 p-8">
      <div className="max-w-3xl space-y-8">

        {/* Back */}
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Invoices
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              {invoice.invoiceNumber ?? <span className="italic text-muted-foreground">No invoice number</span>}
            </h1>
            <p className="text-muted-foreground text-sm">
              {allocation?.regionName} · {invoice.billingPeriodLabel} · {fmtDate(invoice.invoiceDate)}
            </p>
          </div>
          <StatusBadge status={invoice.paymentStatus} />
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Subtotal (excl. VAT)', value: fmt(invoice.subtotal) },
            { label: `VAT (15%)`, value: fmt(invoice.vat) },
            { label: 'Gross total', value: fmt(invoice.gross), bold: true },
          ].map(({ label, value, bold }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className={`text-xl ${bold ? 'font-bold text-foreground' : 'font-semibold text-foreground'}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Invoice number (editable) */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
            Sage sync
          </h2>
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-1.5">
              <label className="text-sm font-medium text-foreground">Invoice number</label>
              <input
                defaultValue={invoice.invoiceNumber ?? ''}
                placeholder="Enter Sage invoice number…"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition">
              Save
            </button>
          </div>
          {invoice.sageSyncedAt ? (
            <p className="text-xs text-green-600 dark:text-green-400">
              Last synced to Sage: {fmtDate(invoice.sageSyncedAt.split('T')[0])}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Not yet synced to Sage.</p>
          )}
        </div>

        {/* Payments */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Payments received</h2>
            <button className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition">
              + Record payment
            </button>
          </div>
          {invoicePayments.length === 0 ? (
            <div className="px-5 py-8 text-center text-muted-foreground text-sm">
              No payments recorded yet.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date received</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoicePayments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3 text-foreground">{fmtDate(p.receivedAt)}</td>
                    <td className="px-5 py-3 text-right font-medium text-foreground">{fmt(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/20">
                  <td className="px-5 py-3 text-sm font-medium text-foreground">Outstanding balance</td>
                  <td className={`px-5 py-3 text-right font-bold text-base ${outstanding > 0 ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
                    {fmt(Math.max(outstanding, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* Documents */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Document bundle
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {['Tax Invoice', 'Service Notes', 'Cleaning Schedule', 'EPWP Employee List', 'GPS Coordinates'].map((doc) => (
              <button
                key={doc}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground hover:bg-muted transition text-left"
              >
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                {doc}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
