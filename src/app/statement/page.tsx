'use client';

import { useRouter } from 'next/navigation';
import {
  allocations, invoices, payments, fmt, fmtDate,
} from '@/lib/mock-data';
import { company } from '@/config/company';
import { sumGross, sumPayments, computeOutstanding } from '@/engine';
import { ChevronRight } from 'lucide-react';

export default function StatementHubPage() {
  const router = useRouter();

  // Compute summary stats per allocation
  const rows = allocations.map((a) => {
    const allocInvoices = invoices.filter((i) => i.allocationId === a.id);
    const totalDebit = sumGross(allocInvoices);
    const totalPaid = sumPayments(payments.filter((p) => allocInvoices.some((i) => i.id === p.invoiceId)));
    const outstanding = computeOutstanding(totalDebit, totalPaid);
    return {
      id: a.id,
      region: a.regionName,
      coordinator: a.cotCoordinatorName,
      toilets: a.totalToilets,
      deliveryDate: a.deliveryDate,
      totalPaid,
      outstanding,
    };
  });

  const grandOutstanding = rows.reduce((s, r) => s + r.outstanding, 0);

  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="max-w-5xl space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Project Statement</h1>
            <p className="text-muted-foreground text-sm">
              {company.client} &middot; {company.contractReference} &middot; {company.name}
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>Outstanding AR</p>
            <p className="text-lg font-bold text-destructive">{fmt(grandOutstanding)}</p>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Region</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Coordinator</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Toilets</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Paid</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Outstanding</th>
                <th className="px-4 py-3 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => router.push(`/statement/${r.id}`)}
                  className="hover:bg-muted/30 transition cursor-pointer group"
                >
                  <td className="px-4 py-3.5">
                    <div>
                      <span className="font-medium text-foreground">{r.region}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        Delivered {fmtDate(r.deliveryDate)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">{r.coordinator}</td>
                  <td className="px-4 py-3.5 text-right font-medium text-foreground">{r.toilets}</td>
                  <td className="px-4 py-3.5 text-right text-green-600 dark:text-green-400 font-medium">{fmt(r.totalPaid)}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className={`font-bold ${r.outstanding > 0 ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
                      {fmt(r.outstanding)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground">{rows.length} allocation{rows.length !== 1 ? 's' : ''}</p>
      </div>
    </main>
  );
}
