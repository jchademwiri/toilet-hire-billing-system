import { allocations, areas, employees, serviceSchedules, regions, contract, fmtDate } from '@/lib/mock-data';
import { company } from '@/config/company';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ServiceNotesPage() {
  return (
    <main className="flex-1 p-8">
      <div className="max-w-5xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Service Notes</h1>
          <p className="text-muted-foreground text-sm">
            Per-allocation service logs — pump and clean records for each scheduled service run.
          </p>
        </div>

        {/* Per-allocation service notes */}
        {allocations.map((allocation) => {
          const allocationAreas = areas.filter((a) => a.allocationId === allocation.id);
          const schedule = serviceSchedules.find((s) => s.allocationId === allocation.id);
          const region = regions.find((r) => r.id === allocation.regionId);
          const allocationEmployees = employees.filter((e) =>
            allocationAreas.some((a) => a.id === e.areaId)
          );
          const siteCoordinators = allocationEmployees.filter((e) => e.position === 'Coordinator');

          return (
            <div key={allocation.id} className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Allocation header */}
              <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">{allocation.regionName}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {region?.name ?? '—'} &middot; Delivered {fmtDate(allocation.deliveryDate)} &middot;
                    {schedule ? ` ${schedule.day1} & ${schedule.day2}` : ' Schedule not set'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/service-notes/${allocation.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition"
                  >
                    Print document <ChevronRight className="w-3 h-3" />
                  </Link>
                  <span className="text-xs text-muted-foreground/40">|</span>
                  <Link
                    href={`/allocations/${allocation.id}`}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
                  >
                    Allocation <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Service note details */}
              <div className="p-5 space-y-5">

                {/* Header info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground">Customer VAT</p>
                    <p className="font-medium text-foreground">4000142267</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground">Vendor VAT</p>
                    <p className="font-medium text-foreground">4070272101</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground">Tender Number</p>
                    <p className="font-medium text-foreground">{contract.reference}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground">Vendor Number</p>
                    <p className="font-medium text-foreground">101776</p>
                  </div>
                </div>

                {/* Areas / sites table */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Region</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Site Name</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Site Coordinator</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Toilets</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Comments</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {allocationAreas.map((area) => {
                        const coordinator = employees.find((e) => e.id === area.siteCoordinatorId);
                        return (
                          <tr key={area.id} className="hover:bg-muted/30 transition">
                            <td className="px-4 py-3 font-medium text-foreground">{region?.name ?? '—'}</td>
                            <td className="px-4 py-3 text-foreground">{area.name}</td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {coordinator?.fullname ?? <span className="text-destructive text-xs">Not assigned</span>}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{area.toiletCount}</td>
                            <td className="px-4 py-3 text-muted-foreground italic">—</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Signature block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
                    <p className="text-xs font-medium text-foreground mb-3">Service Provider</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="text-foreground font-medium">{company.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Signature:</span>
                        <span className="text-muted-foreground italic">___________________</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="text-muted-foreground italic">___________________</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
                    <p className="text-xs font-medium text-foreground mb-3">Site Coordinator</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="text-foreground font-medium">
                          {siteCoordinators[0]?.fullname ?? <span className="italic text-muted-foreground">___________________</span>}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Signature:</span>
                        <span className="text-muted-foreground italic">___________________</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="text-muted-foreground italic">___________________</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
