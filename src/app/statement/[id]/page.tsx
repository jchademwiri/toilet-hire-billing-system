import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  invoices, payments, allocations, contract, fmt, fmtDate,
} from '@/lib/mock-data';
import { company } from '@/config/company';
import Image from 'next/image';
import PrintButton from '@/components/PrintButton';
import DocumentSidebar from '@/components/DocumentSidebar';
import { ArrowLeft } from 'lucide-react';

// ── Aging logic ──────────────────────────────────────────────────────────────

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

const BUCKETS: { key: AgingBucket; label: string }[] = [
  { key: '90plus', label: '90+ days' },
  { key: '60', label: '61–90 days' },
  { key: '30', label: '31–60 days' },
  { key: 'current', label: 'Current (0–30 days)' },
];

// ── A4 Statement Document (per allocation) ───────────────────────────────────

function StatementDocument({ allocationId }: { allocationId: string }) {
  const allocation = allocations.find((a) => a.id === allocationId);
  if (!allocation) return null;

  const allocInvoices = invoices
    .filter((i) => i.allocationId === allocationId)
    .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
  const latestInvoiceDate = allocInvoices[0]?.invoiceDate ?? allocation.deliveryDate;
  const enriched = allocInvoices.map((inv) => {
    const paid = payments
      .filter((p) => p.invoiceId === inv.id)
      .reduce((s, p) => s + p.amount, 0);
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
    <div
      id="statement-document"
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
      {/* ── Header ── */}
      <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-4 mb-6">
        <div className="flex items-start gap-4">
          <Image
            src={company.logoPath}
            alt={company.shortName}
            width={100}
            height={46}
            className="object-contain shrink-0 mt-0.5"
            priority
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{company.name}</h1>
            <p className="text-xs text-zinc-600 mt-1">Contract {company.contractReference}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold tracking-wide">PROJECT STATEMENT</p>
          <p className="text-xs text-zinc-600 mt-1">{allocation.regionName}</p>
        </div>
      </div>

      {/* ── Header info ── */}
      <div className="text-xs text-zinc-600 mb-6 pb-4 border-b border-zinc-200">
        <span className="font-semibold">{company.client}</span> &middot;{' '}
        {company.name} &middot;{' '}
        Statement as of {fmtDate(latestInvoiceDate)} &middot;{' '}
        {sorted.length} invoice{sorted.length !== 1 ? 's' : ''}
      </div>

      {/* ── Transactions table ── */}
      <table className="w-full text-xs border-collapse mb-6">
        <thead>
          <tr className="border-b-2 border-zinc-900">
            <th className="text-left py-2 pr-2 font-semibold">Date</th>
            <th className="text-left py-2 pr-2 font-semibold">Invoice #</th>
            <th className="text-left py-2 pr-4 font-semibold">Description</th>
            <th className="text-right py-2 px-2 font-semibold">Debit</th>
            <th className="text-right py-2 px-2 font-semibold">Credit</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((inv) => (
            <tr key={inv.id} className="border-b border-zinc-200">
              <td className="py-1.5 pr-2 text-zinc-600">{fmtDate(inv.invoiceDate)}</td>
              <td className="py-1.5 pr-2 font-medium text-zinc-800">{inv.invoiceNumber ?? '—'}</td>
              <td className="py-1.5 pr-4 text-zinc-700">
                Toilet Hire and Servicing<span className="text-zinc-500"> ({inv.billingPeriodLabel})</span>
              </td>
              <td className="py-1.5 px-2 text-right font-medium text-zinc-800">{fmt(inv.debit)}</td>
              <td className="py-1.5 px-2 text-right text-zinc-700">
                {inv.credit > 0 ? fmt(inv.credit) : <span className="text-zinc-400">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-zinc-900">
            <td colSpan={3} className="py-2 pr-4 text-sm font-semibold text-zinc-800">Totals</td>
            <td className="py-2 px-2 text-right font-bold text-zinc-800">{fmt(totalDebit)}</td>
            <td className="py-2 px-2 text-right font-semibold text-green-700">{fmt(totalCredit)}</td>
          </tr>
        </tfoot>
      </table>

      {/* ── Aging summary (horizontal) ── */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-zinc-800 mb-3 uppercase tracking-wider">Aging Summary</h3>
        <div className="grid grid-cols-5 gap-px bg-zinc-300 border border-zinc-300 rounded overflow-hidden">
          {BUCKETS.map((b) => {
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
            <p className={`text-xs font-bold ${grandTotal > 0 ? 'text-red-700' : 'text-green-700'}`}>
              {fmt(Math.abs(grandTotal))}
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="mt-8 pt-4 border-t border-zinc-200 text-xs text-zinc-500 space-y-0.5">
        <p>Account Holder: {company.name}</p>
        <p>Bank: {contract.bankName}</p>
        <p>Account Number: {contract.accountNumber}</p>
        <p>Branch Code: {contract.branchCode}</p>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function AllocationStatementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const allocation = allocations.find((a) => a.id === id);
  if (!allocation) notFound();

  const allocationInvoices = invoices
    .filter((i) => i.allocationId === id)
    .map((i) => i.id);

  return (
    <main className="flex-1 p-4 md:p-8">
      {/* ── Toolbar ── */}
      <div className="max-w-[210mm] mx-auto mb-4 flex items-center justify-between">
        <Link
          href="/statement"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Allocations
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{allocation.regionName}</span>
          <PrintButton />
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="flex gap-6 items-start justify-center">
        {/* Left: A4 Document Preview */}
        <div className="shrink-0">
          <StatementDocument allocationId={id} />
        </div>

        {/* Right: Document sidebar */}
        <div className="w-72 space-y-4 print:hidden shrink-0">
          <DocumentSidebar
            allocationId={id}
            allocationInvoiceIds={allocationInvoices}
          />
        </div>
      </div>

      {/* ── Print styles ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 0; size: A4; }
          html, body { background: white !important; margin: 0 !important; padding: 0 !important; }
          nav, header, footer, aside, .print\\:hidden { display: none !important; }
          #statement-document {
            visibility: visible;
            box-shadow: none !important;
            position: relative;
          }
        }
      `}} />
    </main>
  );
}
