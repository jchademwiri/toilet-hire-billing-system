import {
  invoices, payments, allocations, contract, fmt, fmtDate,
} from '@/lib/mock-data';
import { company } from '@/config/company';
import { sumPayments, getAgingBucket, AGING_BUCKETS } from '@/engine';
import { A4Page } from './A4Page';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';

// ── A4 Statement Document (per allocation) ───────────────────────────────────

export function StatementDocument({ allocationId }: { allocationId: string }) {
  const allocation = allocations.find((a) => a.id === allocationId);
  if (!allocation) return null;

  const allocInvoices = invoices
    .filter((i) => i.allocationId === allocationId)
    .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
  const latestInvoiceDate = allocInvoices[0]?.invoiceDate ?? allocation.deliveryDate;
  const enriched = allocInvoices.map((inv) => {
    const paid = sumPayments(payments.filter((p) => p.invoiceId === inv.id));
    return {
      ...inv,
      debit: inv.gross,
      credit: paid,
    };
  });

  const sorted = [...enriched].sort(
    (a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
  );

  const totalDebit = sorted.reduce((s, i) => s + i.debit, 0);
  const totalCredit = sorted.reduce((s, i) => s + i.credit, 0);
  const grandTotal = totalDebit - totalCredit;

  return (
    <A4Page id="statement-document">
      <DocumentHeader title="PROJECT STATEMENT" context={allocation.regionName} />

      {/* ── Header info ── */}
      <div className="text-xs text-zinc-600 mb-6 pb-4 border-b border-zinc-200">
        <span className="font-semibold">{company.client}</span> &middot;{' '}
        {company.name} &middot;{' '}
        Statement as of {fmtDate(latestInvoiceDate)} &middot;{' '}
        {sorted.length} invoice{sorted.length !== 1 ? 's' : ''} &middot;{' '}
        {allocation.regionName}
      </div>

      {/* ── Transactions table ── */}
      <table className="w-full text-xs border-collapse mb-6">
        <thead>
          <tr className="bg-zinc-100">
            <th className="text-left py-1.5 px-2 font-semibold border border-zinc-300">Date</th>
            <th className="text-left py-1.5 px-2 font-semibold border border-zinc-300">Invoice #</th>
            <th className="text-left py-1.5 px-2 font-semibold border border-zinc-300">Description</th>
            <th className="text-right py-1.5 px-2 font-semibold border border-zinc-300">Debit</th>
            <th className="text-right py-1.5 px-2 font-semibold border border-zinc-300">Credit</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((inv) => (
            <tr key={inv.id}>
              <td className="py-1 px-2 border border-zinc-200 text-zinc-600">{fmtDate(inv.invoiceDate)}</td>
              <td className="py-1 px-2 border border-zinc-200 font-medium text-zinc-800">{inv.invoiceNumber ?? '—'}</td>
              <td className="py-1 px-2 border border-zinc-200 text-zinc-700">
                Toilet Hire and Servicing<span className="text-zinc-500"> ({inv.billingPeriodLabel})</span>
              </td>
              <td className="py-1 px-2 border border-zinc-200 text-right font-medium text-zinc-800">{fmt(inv.debit)}</td>
              <td className="py-1 px-2 border border-zinc-200 text-right text-zinc-700">
                {inv.credit > 0 ? fmt(inv.credit) : <span className="text-zinc-400">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-zinc-100">
            <td colSpan={3} className="py-1.5 px-2 border border-zinc-300 font-semibold text-zinc-800">Totals</td>
            <td className="py-1.5 px-2 border border-zinc-300 text-right font-bold text-zinc-800">{fmt(totalDebit)}</td>
            <td className="py-1.5 px-2 border border-zinc-300 text-right font-semibold text-zinc-800">{fmt(totalCredit)}</td>
          </tr>
        </tfoot>
      </table>

      {/* ── Aging summary (horizontal) ── */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-zinc-800 mb-3 uppercase tracking-wider">Aging Summary</h3>
        <div className="grid grid-cols-5 gap-px bg-zinc-300 border border-zinc-300 rounded overflow-hidden">
          {AGING_BUCKETS.map((b) => {
            const total = sorted
              .filter((i) => getAgingBucket(i.invoiceDate, i.paymentStatus) === b.key)
              .reduce((s, i) => s + (i.debit - i.credit), 0);
            return (
              <div key={b.key} className="bg-white px-3 py-2.5 text-center">
                <p className="text-[8pt] text-zinc-500 mb-1 leading-tight">{b.label}</p>
                <p className="text-xs font-bold text-zinc-800">
                  {total > 0 ? fmt(total) : <span className="text-zinc-400 font-normal">—</span>}
                </p>
              </div>
            );
          })}
          <div className="bg-zinc-50 px-3 py-2.5 text-center">
            <p className="text-[8pt] text-zinc-500 mb-1 leading-tight font-semibold">Total Outstanding</p>
            <p className="text-xs font-bold text-zinc-800">
              {fmt(Math.abs(grandTotal))}
            </p>
          </div>
        </div>
      </div>

      {/* ── Banking details ── */}
      <div className="pt-4 border-t border-zinc-200 text-xs text-zinc-500 space-y-0.5">
        <p>Account Holder: {company.name}</p>
        <p>Bank: {contract.bankName}</p>
        <p>Account Number: {contract.accountNumber}</p>
        <p>Branch Code: {contract.branchCode}</p>
      </div>

      <DocumentFooter />
    </A4Page>
  );
}
