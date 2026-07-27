import {
  allocations, areas, employees, serviceSchedules, regions,
} from '@/lib/mock-data';
import { A4Page } from './A4Page';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';

// ── A4 Service Schedule Document ─────────────────────────────────────────────

export function ScheduleDocument({ allocationId }: { allocationId: string }) {
  const allocation = allocations.find((a) => a.id === allocationId);
  if (!allocation) return null;

  const allocationAreas = areas.filter((a) => a.allocationId === allocationId);
  const schedule = serviceSchedules.find((s) => s.allocationId === allocationId);
  const region = regions.find((r) => r.id === allocation.regionId);

  return (
    <A4Page id="schedule-document">
      <DocumentHeader title="SERVICE SCHEDULE" />

      {/* ── Info line ── */}
      <div className="text-xs text-zinc-600 mb-6 pb-4 border-b border-zinc-200">
        <span className="font-semibold">Region:</span> {region?.name ?? '—'} &middot;{' '}
        <span className="font-semibold">CoT Coordinator:</span> {allocation.cotCoordinatorName} &middot;{' '}
        <span className="font-semibold">Total toilets:</span> {allocation.totalToilets} &middot;{' '}
        <span className="font-semibold">Areas:</span> {allocationAreas.length}
      </div>

      {/* ── Per-area breakdown ── */}
      <table className="w-full text-xs border-collapse mb-4">
        <thead>
          <tr className="bg-zinc-100">
            <th className="text-left py-1.5 px-2 font-semibold border border-zinc-300">#</th>
            <th className="text-left py-1.5 px-2 font-semibold border border-zinc-300">Area</th>
            <th className="text-right py-1.5 px-2 font-semibold border border-zinc-300">Toilets</th>
            <th className="text-left py-1.5 px-2 font-semibold border border-zinc-300">Site Coordinator</th>
            <th className="text-right py-1.5 px-2 font-semibold border border-zinc-300">Cleaners</th>
            <th className="text-left py-1.5 px-2 font-semibold border border-zinc-300">Service Days</th>
          </tr>
        </thead>
        <tbody>
          {allocationAreas.map((area, idx) => {
            const coordinator = employees.find((e) => e.id === area.siteCoordinatorId);
            const cleaners = employees.filter(
              (e) => e.areaId === area.id && e.position === 'Cleaner'
            );
            return (
              <tr key={area.id}>
                <td className="py-1 px-2 border border-zinc-200 text-zinc-600">{idx + 1}</td>
                <td className="py-1 px-2 border border-zinc-200 font-medium">{area.name}</td>
                <td className="py-1 px-2 border border-zinc-200 text-right">{area.toiletCount}</td>
                <td className="py-1 px-2 border border-zinc-200 text-zinc-700">{coordinator?.fullname ?? '—'}</td>
                <td className="py-1 px-2 border border-zinc-200 text-right">{cleaners.length}</td>
                <td className="py-1 px-2 border border-zinc-200 text-zinc-700">
                  {schedule ? `${schedule.day1} & ${schedule.day2}` : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ── Summary stats ── */}
      <div className="flex justify-end mb-8">
        <table className="text-xs w-48">
          <tbody>
            <tr>
              <td className="py-1 pr-4 text-zinc-600">Total areas</td>
              <td className="py-1 text-right font-medium">{allocationAreas.length}</td>
            </tr>
            <tr>
              <td className="py-1 pr-4 text-zinc-600">Total toilets</td>
              <td className="py-1 text-right font-medium">{allocation.totalToilets}</td>
            </tr>
            <tr>
              <td className="py-1 pr-4 text-zinc-600">Total staff</td>
              <td className="py-1 text-right font-medium">
                {employees.filter((e) => allocationAreas.some((a) => a.id === e.areaId)).length}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <DocumentFooter />
    </A4Page>
  );
}
