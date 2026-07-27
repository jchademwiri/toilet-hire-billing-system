'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { invoices, fmt, fmtDate } from '@/lib/mock-data';
import { sumGross } from '@/engine';
import { FileText, ChevronRight, AlertCircle, CheckCircle2, Clock, Filter } from 'lucide-react';

type StatusFilter = 'All' | 'PAID' | 'OUTSTANDING' | 'DRAFT';

function InvoiceStatusBadge({ status }: { status: string }) {
  if (status === 'PAID') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
      <CheckCircle2 className="w-3 h-3" />Paid
    </span>
  );
  if (status === 'OUTSTANDING') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
      <AlertCircle className="w-3 h-3" />Outstanding
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
      <Clock className="w-3 h-3" />Draft
    </span>
  );
}

export default function InvoicesPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

  const filtered = invoices.filter(
    (i) => statusFilter === 'All' || i.paymentStatus === statusFilter
  );

  const totalGross = sumGross(filtered);

  return (
    <main className="flex-1 p-8">
      <div className="max-w-5xl space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Invoices</h1>
          <p className="text-muted-foreground text-sm">
            Full invoice register across every allocation.
          </p>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total invoices', value: invoices.length.toString() },
            { label: 'Outstanding', value: fmt(sumGross(invoices.filter((i) => i.paymentStatus === 'OUTSTANDING'))) },
            { label: 'Collected', value: fmt(sumGross(invoices.filter((i) => i.paymentStatus === 'PAID'))) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-border bg-card px-5 py-4">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="text-xl font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-background w-fit">
          {(['All', 'OUTSTANDING', 'PAID', 'DRAFT'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                statusFilter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'All' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoice #</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Allocation</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Period</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gross</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => router.push(`/invoices/${inv.id}`)}
                  className="hover:bg-muted/30 transition cursor-pointer group"
                >
                  <td className="px-5 py-4 font-medium text-foreground">
                    {inv.invoiceNumber ?? <span className="italic text-muted-foreground text-xs">Pending</span>}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{inv.allocationName}</td>
                  <td className="px-5 py-4 text-muted-foreground">{inv.billingPeriodLabel}</td>
                  <td className="px-5 py-4 text-muted-foreground">{fmtDate(inv.invoiceDate)}</td>
                  <td className="px-5 py-4 text-right font-semibold text-foreground">{fmt(inv.gross)}</td>
                  <td className="px-5 py-4"><InvoiceStatusBadge status={inv.paymentStatus} /></td>
                  <td className="px-5 py-4">
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground text-sm">
                    No invoices match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          {filtered.length} invoice{filtered.length !== 1 ? 's' : ''} · Total: {fmt(totalGross)}
        </p>
      </div>
    </main>
  );
}
