import { invoices, payments, allocations, fmt, fmtDate } from '@/lib/mock-data';
import { AlertCircle } from 'lucide-react';

type AgingBucket = 'current' | '30' | '60' | '90plus';

function getAgingBucket(invoiceDate: string, status: string): AgingBucket {
  if (status !== 'OUTSTANDING') return 'current';
  const today = new Date();
  const issued = new Date(invoiceDate);
  const days = Math.floor((today.getTime() - issued.getTime()) / 86400000);
  if (days <= 30) return 'current';
  if (days <= 60) return '30';
  if (days <= 90) return '60';
  return '90plus';
}

const BUCKETS: { key: AgingBucket; label: string; color: string }[] = [
  { key: 'current', label: 'Current', color: 'text-green-600 dark:text-green-400' },
  { key: '30', label: '31–60 days', color: 'text-amber-600 dark:text-amber-400' },
  { key: '60', label: '61–90 days', color: 'text-orange-600 dark:text-orange-400' },
  { key: '90plus', label: '90+ days', color: 'text-destructive' },
];

export default function AgingPage() {
  const outstanding = invoices.filter((i) => i.paymentStatus === 'OUTSTANDING');
  const invoicePayments = payments;

  const enriched = outstanding.map((inv) => {
    const paid = invoicePayments.filter((p) => p.invoiceId === inv.id).reduce((s, p) => s + p.amount, 0);
    const balance = inv.gross - paid;
    const bucket = getAgingBucket(inv.invoiceDate, inv.paymentStatus);
    const allocation = allocations.find((a) => a.id === inv.allocationId);
    return { ...inv, balance, bucket, allocationName: allocation?.regionName ?? inv.allocationName };
  });

  const bucketTotals = BUCKETS.map(({ key }) => ({
    key,
    total: enriched.filter((i) => i.bucket === key).reduce((s, i) => s + i.balance, 0),
  }));

  const grandTotal = enriched.reduce((s, i) => s + i.balance, 0);

  return (
    <main className="flex-1 p-8">
      <div className="max-w-5xl space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Statement & Aging</h1>
          <p className="text-muted-foreground text-sm">
            Accounts receivable — outstanding invoices bucketed by age.
          </p>
        </div>

        {/* Aging summary buckets */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {BUCKETS.map(({ key, label, color }) => {
            const total = bucketTotals.find((b) => b.key === key)?.total ?? 0;
            return (
              <div key={key} className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={`text-xl font-bold ${total > 0 ? color : 'text-muted-foreground'}`}>
                  {fmt(total)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Grand total */}
        <div className="flex items-center justify-between px-5 py-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-semibold text-foreground">Total outstanding AR</span>
          </div>
          <span className="text-xl font-bold text-destructive">{fmt(grandTotal)}</span>
        </div>

        {/* Detail table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Outstanding invoices</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoice #</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Allocation</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Period</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoice date</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Balance due</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {enriched.map((inv) => {
                const bucket = BUCKETS.find((b) => b.key === inv.bucket)!;
                return (
                  <tr key={inv.id} className="hover:bg-muted/30 transition">
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      {inv.invoiceNumber ?? <span className="italic text-muted-foreground text-xs">Pending</span>}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{inv.allocationName}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{inv.billingPeriodLabel}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{fmtDate(inv.invoiceDate)}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-foreground">{fmt(inv.balance)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium ${bucket.color}`}>{bucket.label}</span>
                    </td>
                  </tr>
                );
              })}
              {enriched.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground text-sm">
                    No outstanding invoices. 🎉
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
