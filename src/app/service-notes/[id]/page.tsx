import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  allocations, areas, invoices, billingPeriods, serviceSchedules, regions,
  contract, fmtDate,
} from '@/lib/mock-data';
import { company } from '@/config/company';
import Image from 'next/image';
import PrintButton from '@/components/PrintButton';
import DocumentSidebar from '@/components/DocumentSidebar';
import { ArrowLeft } from 'lucide-react';

// ── A4 Service Notes Document (EXACT Excel format) ──────────────────────────

function ServiceNotesDocument({ allocationId }: { allocationId: string }) {
  const allocation = allocations.find((a) => a.id === allocationId);
  if (!allocation) return null;

  const allocationAreas = areas.filter((a) => a.allocationId === allocationId);
  const region = regions.find((r) => r.id === allocation.regionId);

  // Latest invoice for this allocation → signature/document date
  const allocInvoices = invoices
    .filter((i) => i.allocationId === allocationId)
    .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
  const latestInvoice = allocInvoices[0];
  const docDate = latestInvoice?.invoiceDate ?? allocation.deliveryDate;

  // Compute actual service dates within the latest billing period
  const schedule = serviceSchedules.find((s) => s.allocationId === allocationId);
  const latestPeriod = billingPeriods.find((p) => p.id === latestInvoice?.billingPeriodId);
  const dayMap: Record<string, number> = {
    Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 0,
  };
  const serviceDates: string[] = [];
  if (schedule && latestPeriod) {
    const targets = [dayMap[schedule.day1], dayMap[schedule.day2]].filter((d) => d !== undefined);
    const cursor = new Date(latestPeriod.periodStart);
    const end = new Date(latestPeriod.periodEnd);
    while (cursor <= end) {
      if (targets.includes(cursor.getDay())) {
        serviceDates.push(new Date(cursor).toISOString().split('T')[0]);
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return (
    <div
      id="service-notes-document"
      className="bg-white text-zinc-900 shadow-xl mx-auto"
      style={{
        width: '297mm',
        minHeight: '210mm',
        padding: '15mm 20mm',
        fontFamily: 'var(--font-inter), Arial, sans-serif',
        fontSize: '9pt',
        lineHeight: '1.5',
      }}
    >
      {/* ── Branded header row ── */}
      <div className="flex justify-between items-center border-b border-zinc-300 pb-3 mb-4">
        <Image
          src={company.logoPath}
          alt={company.shortName}
          width={70}
          height={32}
          className="object-contain shrink-0"
          priority
        />
        <div className="text-right">
          <p className="text-sm font-bold tracking-tight">{company.name}</p>
          <p className="text-xs text-zinc-500">Contract {contract.reference}</p>
        </div>
      </div>

      {/* ── Title ── */}
      <p className="text-center text-xs font-bold text-zinc-900 mb-1 uppercase tracking-wider">
        SERVICE NOTE - PUMP &amp; CLEAN
      </p>

      {/* ── Spacer ── */}
      <div className="h-3" />

      {/* ── Client info ── */}
      <p className="text-xs font-bold text-zinc-900 mb-1">CITY OF TSHWANE</p>
      <p className="text-xs text-zinc-700 mb-1">Region 3, Water &amp; Sanitation, Capital Towers, 0001</p>
      <p className="text-xs text-zinc-700 mb-6">Date: {fmtDate(docDate)}</p>

      {/* ── Number of toilets onsite ── */}
      <p className="text-xs text-zinc-900 mb-8">
        Number of toilets onsite: <span className="font-bold underline">{allocation.totalToilets}</span>
      </p>

      {/* ── Metadata grid ── */}
      <div className="grid grid-cols-4 gap-x-4 gap-y-1 text-xs mb-8">
        <div>
          <p className="font-semibold text-zinc-800">Customer VAT No:</p>
          <p className="text-zinc-700">4000142267</p>
        </div>
        <div>
          <p className="font-semibold text-zinc-800">VAT No:</p>
          <p className="text-zinc-700">4070272101</p>
        </div>
        <div>
          <p className="font-semibold text-zinc-800">Tender Number:</p>
          <p className="text-zinc-700">{contract.reference}</p>
        </div>
        <div>
          <p className="font-semibold text-zinc-800">Vendor Number:</p>
          <p className="text-zinc-700">101776</p>
        </div>
      </div>

      {/* ── Main table: REGION NUMBER | SITE NAME | SERVICE DATES ── */}
      <table className="w-full text-xs border-collapse mb-8">
        <thead>
          <tr className="border-b-2 border-zinc-900">
            <th className="text-left py-2 pr-3 font-semibold w-24">REGION NUMBER</th>
            <th className="text-left py-2 pr-3 font-semibold">SITE NAME</th>
            <th className="text-left py-2 font-semibold">SERVICE DATES</th>
          </tr>
        </thead>
        <tbody>
          {allocationAreas.map((area) => (
            <tr key={area.id} className="border-b border-zinc-200">
              <td className="py-2 pr-3 font-medium text-zinc-800">
                {region?.name ?? '—'} &middot; Site {allocationAreas.indexOf(area) + 1}
              </td>
              <td className="py-2 pr-3 text-zinc-800">{area.name}</td>
              <td className="py-2 text-zinc-700 text-xs">
                {serviceDates.length > 0
                  ? serviceDates.map((d) => fmtDate(d)).join(', ')
                  : <span className="text-zinc-400 italic">—</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Spacer to push signature to bottom ── */}
      <div style={{ minHeight: '60mm' }} />

      {/* ── Signature blocks side by side ── */}
      <div className="grid grid-cols-2 gap-8 mt-8">
        {/* Service Provider */}
        <div>
          <p className="text-xs font-bold text-zinc-900 mb-4 uppercase">Service Provider</p>
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-600 w-28">Name and surname:</span>
              <span className="font-medium text-zinc-800 border-b border-zinc-300 flex-1 pb-0.5">
                {company.name}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-zinc-600 w-28 shrink-0">Signature:</span>
              <Image
                src={company.signaturePath}
                alt="Signature"
                width={120}
                height={40}
                className="object-contain border-b border-zinc-300 pb-0.5"
                priority
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-600 w-28">Date:</span>
              <span className="font-medium text-zinc-800 border-b border-zinc-300 flex-1 pb-0.5">
                {fmtDate(docDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Site Co-ordinator */}
        <div>
          <p className="text-xs font-bold text-zinc-900 mb-4 uppercase">Site Co-ordinator</p>
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-600 w-28">Name and surname:</span>
              <span className="font-medium text-zinc-800 border-b border-zinc-300 flex-1 pb-0.5">
                ___________________
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-600 w-28">Signature:</span>
              <span className="border-b border-zinc-300 flex-1 pb-0.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-600 w-28">Date:</span>
              <span className="font-medium text-zinc-800 border-b border-zinc-300 flex-1 pb-0.5">
                {fmtDate(docDate)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ServiceNotesDetailPage({
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
      <div className="max-w-[297mm] mx-auto mb-4 flex items-center justify-between">
        <Link
          href="/service-notes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Service Notes
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
          <ServiceNotesDocument allocationId={id} />
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
          @page { margin: 0; size: A4 landscape; }
          html, body { background: white !important; margin: 0 !important; padding: 0 !important; }
          nav, header, footer, aside, .print\:hidden { display: none !important; }
          #service-notes-document {
            visibility: visible;
            box-shadow: none !important;
            position: relative;
          }
        }
      `}} />
    </main>
  );
}
