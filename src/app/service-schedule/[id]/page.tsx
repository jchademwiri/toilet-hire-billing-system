import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  allocations, areas, employees, invoices, serviceSchedules, regions, contract,
} from '@/lib/mock-data';
import { company } from '@/config/company';
import Image from 'next/image';
import PrintButton from '@/components/PrintButton';
import DocumentSidebar from '@/components/DocumentSidebar';
import { ArrowLeft, Check } from 'lucide-react';

// ── A4 Service Schedule Document ─────────────────────────────────────────────

function ScheduleDocument({ allocationId }: { allocationId: string }) {
  const allocation = allocations.find((a) => a.id === allocationId);
  if (!allocation) return null;

  const allocationAreas = areas.filter((a) => a.allocationId === allocationId);
  const schedule = serviceSchedules.find((s) => s.allocationId === allocationId);
  const region = regions.find((r) => r.id === allocation.regionId);

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div
      id="schedule-document"
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
        <div className="flex items-start gap-3">
          <Image
            src={company.logoPath}
            alt={company.shortName}
            width={80}
            height={37}
            className="object-contain shrink-0 mt-0.5"
            priority
          />
          <div>
            <h1 className="text-lg font-bold tracking-tight">{company.name}</h1>
            <p className="text-xs text-zinc-600 mt-0.5">Contract {contract.reference}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold tracking-wide uppercase">Service Schedule</p>
          <p className="text-xs text-zinc-600 mt-0.5">{allocation.regionName}</p>
        </div>
      </div>

      {/* ── Info line ── */}
      <div className="text-xs text-zinc-600 mb-6 pb-4 border-b border-zinc-200">
        <span className="font-semibold">Region:</span> {region?.name ?? '—'} &middot;{' '}
        <span className="font-semibold">CoT Coordinator:</span> {allocation.cotCoordinatorName} &middot;{' '}
        <span className="font-semibold">Total toilets:</span> {allocation.totalToilets} &middot;{' '}
        <span className="font-semibold">Areas:</span> {allocationAreas.length}
      </div>

      {/* ── Service days — ONLY this section ── */}
      <div className="border-2 border-zinc-900 rounded-lg p-8 mb-8 text-center">
        <h2 className="text-sm font-semibold text-zinc-800 mb-5 uppercase tracking-wider">
          Service Days
        </h2>
        <div className="flex flex-wrap gap-4 justify-center">
          {allDays.map((day) => {
            const isActive = schedule && (schedule.day1 === day || schedule.day2 === day);
            return (
              <div
                key={day}
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-zinc-900 text-white ring-2 ring-zinc-900 ring-offset-2'
                    : 'bg-zinc-100 text-zinc-400'
                }`}
              >
                {isActive && <Check className="w-4 h-4" />}
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Per-area breakdown ── */}
      <h2 className="text-sm font-semibold text-zinc-800 mb-3">Areas</h2>
      <table className="w-full text-xs border-collapse mb-6">
        <thead>
          <tr className="border-b-2 border-zinc-900">
            <th className="text-left py-2 pr-2 font-semibold">#</th>
            <th className="text-left py-2 pr-2 font-semibold">Area</th>
            <th className="text-right py-2 px-2 font-semibold">Toilets</th>
            <th className="text-left py-2 pr-2 font-semibold">Site Coordinator</th>
            <th className="text-right py-2 px-2 font-semibold">Cleaners</th>
            <th className="text-left py-2 pl-2 font-semibold">Service Days</th>
          </tr>
        </thead>
        <tbody>
          {allocationAreas.map((area, idx) => {
            const coordinator = employees.find((e) => e.id === area.siteCoordinatorId);
            const cleaners = employees.filter(
              (e) => e.areaId === area.id && e.position === 'Cleaner'
            );
            return (
              <tr key={area.id} className="border-b border-zinc-200">
                <td className="py-2 pr-2 text-zinc-600">{idx + 1}</td>
                <td className="py-2 pr-2 font-medium">{area.name}</td>
                <td className="py-2 px-2 text-right">{area.toiletCount}</td>
                <td className="py-2 pr-2 text-zinc-700">{coordinator?.fullname ?? '—'}</td>
                <td className="py-2 px-2 text-right">{cleaners.length}</td>
                <td className="py-2 pl-2 text-zinc-700">
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

      {/* ── Footer ── */}
      <div className="mt-8 pt-4 border-t border-zinc-200 text-xs text-zinc-500">
        <p>{company.name} &middot; {contract.reference}</p>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ScheduleDetailPage({
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
          href="/allocations"
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
          <ScheduleDocument allocationId={id} />
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
          #schedule-document {
            visibility: visible;
            box-shadow: none !important;
            position: relative;
          }
        }
      `}} />
    </main>
  );
}
