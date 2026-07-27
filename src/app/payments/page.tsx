'use client';

import { useState } from 'react';
import { payments, invoices, fmt, fmtDate } from '@/lib/mock-data';
import { sumPayments } from '@/engine';
import { Plus, CreditCard } from 'lucide-react';

export default function PaymentsPage() {
  const [showForm, setShowForm] = useState(false);

  // Join payments with their invoices
  const enriched = payments.map((p) => {
    const invoice = invoices.find((i) => i.id === p.invoiceId);
    return { ...p, invoice };
  });

  const total = sumPayments(payments);

  return (
    <main className="flex-1 p-8">
      <div className="max-w-4xl space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Payments</h1>
            <p className="text-muted-foreground text-sm">
              All payments received against invoices.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition"
          >
            <Plus className="w-4 h-4" />
            Record payment
          </button>
        </div>

        {/* Record payment form */}
        {showForm && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              Record a payment
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Invoice</label>
                <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select invoice…</option>
                  {invoices.filter((i) => i.paymentStatus === 'OUTSTANDING').map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.invoiceNumber ?? 'No number'} — {fmt(i.gross)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Amount received</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Date received</label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition">
                Save payment
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card px-5 py-4">
            <p className="text-xs text-muted-foreground mb-1">Total received</p>
            <p className="text-2xl font-bold text-foreground">{fmt(total)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card px-5 py-4">
            <p className="text-xs text-muted-foreground mb-1">Payments recorded</p>
            <p className="text-2xl font-bold text-foreground">{payments.length}</p>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoice</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Allocation</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Period</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date received</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {enriched.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition">
                  <td className="px-5 py-3.5 font-medium text-foreground">
                    {p.invoice?.invoiceNumber ?? <span className="italic text-muted-foreground text-xs">No number</span>}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{p.invoice?.allocationName ?? '—'}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{p.invoice?.billingPeriodLabel ?? '—'}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{fmtDate(p.receivedAt)}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-foreground">{fmt(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">{payments.length} payment{payments.length !== 1 ? 's' : ''} · {fmt(total)} total</p>
      </div>
    </main>
  );
}
