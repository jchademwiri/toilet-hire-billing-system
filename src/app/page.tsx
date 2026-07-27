import Link from 'next/link';
import { company } from '@/config/company';
import {
  allocations,
  invoices,
  totalActiveToilets,
  totalOutstandingAR,
  employees,
  fmt,
  fmtDate,
  serviceSchedules,
} from '@/lib/mock-data';
import {
  Toilet,
  MapPin,
  DollarSign,
  CalendarDays,
  CheckCircle2,
  Clock,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

function StatCard({ label, value, icon: Icon, sub }: {
  label: string; value: string; icon: React.ElementType; sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'COMPLETE') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
      <CheckCircle2 className="w-3 h-3" />Complete
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
      <Clock className="w-3 h-3" />In progress
    </span>
  );
}

function InvoiceStatusBadge({ status }: { status: string }) {
  if (status === 'PAID') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Paid</span>
  );
  if (status === 'OUTSTANDING') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
      <AlertCircle className="w-3 h-3" />Outstanding
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">Draft</span>
  );
}

// Next service date from schedules (next Tuesday or Thursday from today)
const nextServiceDate = (() => {
  const dayMap: Record<string, number> = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
    Thursday: 4, Friday: 5, Saturday: 6,
  };
  const today = new Date();
  const targets = serviceSchedules.flatMap((s) => [s.day1, s.day2]);
  const unique = [...new Set(targets)];
  let nearest: Date | null = null;
  for (const day of unique) {
    const target = dayMap[day];
    if (target === undefined) continue;
    const diff = (target - today.getDay() + 7) % 7 || 7;
    const candidate = new Date(today);
    candidate.setDate(today.getDate() + diff);
    if (!nearest || candidate < nearest) nearest = candidate;
  }
  return nearest
    ? nearest.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })
    : '—';
})();

export default function DashboardPage() {
  const outstandingInvoices = invoices.filter((i) => i.paymentStatus === 'OUTSTANDING');

  return (
    <main className="flex-1 p-8">
      <div className="max-w-6xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            {company.contractReference} · {company.client} {company.description}
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Active toilets"
            value={totalActiveToilets.toString()}
            icon={Toilet}
            sub={`across ${allocations.length} allocations`}
          />
          <StatCard
            label="Cleaners assigned"
            value={employees.filter((e) => e.position === 'Cleaner').length.toString()}
            icon={MapPin}
            sub={`${employees.filter((e) => e.position === 'Coordinator').length} coordinators`}
          />
          <StatCard
            label="Outstanding AR"
            value={fmt(totalOutstandingAR)}
            icon={DollarSign}
            sub={`${outstandingInvoices.length} unpaid invoice${outstandingInvoices.length !== 1 ? 's' : ''}`}
          />
          <StatCard
            label="Next service run"
            value={nextServiceDate}
            icon={CalendarDays}
          />
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Allocations table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Allocations</h2>
              <Link href="/allocations" className="text-xs text-muted-foreground hover:text-foreground transition">
                View all →
              </Link>
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                {allocations.map((a) => (
                  <tr key={a.id} className="group">
                    <td className="px-5 py-3">
                      <Link href={`/allocations/${a.id}`} className="block">
                        <span className="font-medium text-foreground">{a.regionName}</span>
                        <span className="text-xs text-muted-foreground ml-2">{a.cotCoordinatorName}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <StatusBadge status={a.onboardingStatus} />
                    </td>
                    <td className="px-3 py-3 w-5">
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent invoices */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Recent invoices</h2>
              <Link href="/invoices" className="text-xs text-muted-foreground hover:text-foreground transition">
                View all →
              </Link>
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                {invoices.slice(0, 5).map((inv) => (
                  <tr key={inv.id} className="group">
                    <td className="px-5 py-3">
                      <Link href={`/invoices/${inv.id}`} className="block">
                        <span className="font-medium text-foreground">
                          {inv.invoiceNumber ?? <span className="text-muted-foreground italic">No number</span>}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">{inv.billingPeriodLabel}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-foreground text-xs">
                      {fmt(inv.gross)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <InvoiceStatusBadge status={inv.paymentStatus} />
                    </td>
                    <td className="px-3 py-3 w-5">
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
