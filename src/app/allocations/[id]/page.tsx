import Link from 'next/link';
import { notFound } from 'next/navigation';
import { company } from '@/config/company';
import {
  allocations, areas, employees, serviceSchedules, invoices, fmt, fmtDate,
} from '@/lib/mock-data';
import {
  ArrowLeft, MapPin, Users, CalendarDays, FileText,
  CheckCircle2, ClipboardCheck, Clock, ChevronRight, Toilet,
} from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  if (status === 'COMPLETE') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
      <CheckCircle2 className="w-3 h-3" />Complete
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
      <Clock className="w-3 h-3" />In progress
    </span>
  );
}

export default async function AllocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const allocation = allocations.find((a) => a.id === id);
  if (!allocation) notFound();

  const allocationAreas = areas.filter((a) => a.allocationId === id);
  const schedule = serviceSchedules.find((s) => s.allocationId === id);
  const allocationInvoices = invoices.filter((i) => i.allocationId === id);
  const totalEmployees = employees.filter((e) =>
    allocationAreas.some((a) => a.id === e.areaId)
  );

  return (
    <main className="flex-1 p-8">
      <div className="max-w-5xl space-y-8">

        {/* Back + header */}
        <div>
          <Link
            href="/allocations"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Allocations
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">{allocation.regionName}</h1>
              <p className="text-muted-foreground text-sm">
                {company.coordinatorLabel}: {allocation.cotCoordinatorName} · Delivered {fmtDate(allocation.deliveryDate)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={allocation.onboardingStatus} />
              {allocation.onboardingStatus === 'COMPLETE' && (
                <Link
                  href={`/billing?allocation=${id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition"
                >
                  <FileText className="w-4 h-4" />
                  Billing hub
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total toilets', value: allocation.totalToilets, icon: Toilet },
            { label: 'Areas', value: allocationAreas.length, icon: MapPin },
            { label: 'Staff', value: totalEmployees.length, icon: Users },
            { label: 'Invoices', value: allocationInvoices.length, icon: FileText },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{label}</span>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Areas */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />Areas
              </h2>
              <span className="text-xs text-muted-foreground">{allocationAreas.length} areas</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Area</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Toilets</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Coordinator</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cleaners</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allocationAreas.map((area) => {
                  const coordinator = employees.find((e) => e.id === area.siteCoordinatorId);
                  const cleaners = employees.filter((e) => e.areaId === area.id && e.position === 'Cleaner');
                  return (
                    <tr key={area.id} className="hover:bg-muted/30 transition">
                      <td className="px-5 py-3 font-medium text-foreground">{area.name}</td>
                      <td className="px-5 py-3 text-right text-muted-foreground">{area.toiletCount}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {coordinator?.fullname ?? <span className="text-destructive text-xs">Not assigned</span>}
                      </td>
                      <td className="px-5 py-3 text-right text-muted-foreground">{cleaners.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Sidebar: schedule + invoices */}
          <div className="space-y-4">
            {/* Service schedule */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />Service schedule
              </h2>
              {schedule ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    {[schedule.day1, schedule.day2].map((day) => (
                      <span key={day} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium">
                        {day}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Effective from {fmtDate(schedule.effectiveFrom)}</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Not configured yet.</p>
              )}
            </div>

            {/* Documents */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border bg-muted/30">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />Documents
                </h2>
              </div>
              <div className="divide-y divide-border">
                <Link
                  href={`/service-notes/${id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition group"
                >
                  <ClipboardCheck className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-xs font-medium text-foreground">Service Notes</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition" />
                </Link>
                <Link
                  href={`/coordinates/${id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition group"
                >
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-xs font-medium text-foreground">GPS Coordinates</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition" />
                </Link>
                <Link
                  href={`/service-schedule/${id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition group"
                >
                  <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-xs font-medium text-foreground">Service Schedule</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition" />
                </Link>
              </div>
            </div>

            {/* Invoices */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />Invoices
                </h2>
                <Link href="/invoices" className="text-xs text-muted-foreground hover:text-foreground transition">
                  All →
                </Link>
              </div>
              {allocationInvoices.length === 0 ? (
                <p className="px-5 py-4 text-xs text-muted-foreground">No invoices yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {allocationInvoices.map((inv) => (
                    <Link
                      key={inv.id}
                      href={`/invoices/${inv.id}`}
                      className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition group"
                    >
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          {inv.invoiceNumber ?? <span className="italic text-muted-foreground">No number</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">{inv.billingPeriodLabel}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-foreground">{fmt(inv.gross)}</p>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
