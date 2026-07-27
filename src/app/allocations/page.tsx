'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { allocations, areas, fmtDate } from '@/lib/mock-data';
import { company } from '@/config/company';
import {
  Plus,
  MapPin,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter,
} from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  if (status === 'COMPLETE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle2 className="w-3 h-3" />
        Complete
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
      <Clock className="w-3 h-3" />
      In progress
    </span>
  );
}

export default function AllocationsPage() {
  const router = useRouter();

  return (
    <main className="flex-1 p-8">
      <div className="max-w-6xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Allocations</h1>
            <p className="text-muted-foreground">
              All toilet allocations across every region — the primary invoicing unit.
            </p>
          </div>
          <Link
            href="/allocations/new"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition"
          >
            <Plus className="w-4 h-4" />
            New allocation
          </Link>
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-3 mb-6">
          <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition">
            <Filter className="w-3.5 h-3.5" />
            All regions
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition">
            All statuses
          </button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Region / Allocation
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {company.coordinatorLabel}
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Delivery date
                </th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Toilets
                </th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Areas
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Onboarding
                </th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allocations.map((a) => {
                const areaCount = areas.filter((ar) => ar.allocationId === a.id).length;
                return (
                  <tr
                    key={a.id}
                    onClick={() => router.push(`/allocations/${a.id}`)}
                    className="hover:bg-muted/30 transition group cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="font-medium text-foreground">{a.regionName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{a.cotCoordinatorName}</td>
                    <td className="px-5 py-4 text-muted-foreground">{fmtDate(a.deliveryDate)}</td>
                    <td className="px-5 py-4 text-right font-medium text-foreground">{a.totalToilets}</td>
                    <td className="px-5 py-4 text-right text-muted-foreground">{areaCount}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={a.onboardingStatus} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {allocations.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="mb-4">No allocations yet.</p>
              <Link
                href="/allocations/new"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition"
              >
                <Plus className="w-4 h-4" />
                Create your first allocation
              </Link>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          {allocations.length} allocation{allocations.length !== 1 ? 's' : ''} total
        </p>
      </div>
    </main>
  );
}
