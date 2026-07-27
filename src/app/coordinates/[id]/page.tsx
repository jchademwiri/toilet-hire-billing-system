import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  allocations, areas, invoices, billingPeriods, regions, contract, fmtDate,
} from '@/lib/mock-data';
import { company } from '@/config/company';
import Image from 'next/image';
import PrintButton from '@/components/PrintButton';
import DocumentSidebar from '@/components/DocumentSidebar';
import { ArrowLeft } from 'lucide-react';

// ── Helper: DMS formatting ───────────────────────────────────────────────────

function toDMS(lat: number, lng: number) {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  const absLat = Math.abs(lat);
  const absLng = Math.abs(lng);

  const latDeg = Math.floor(absLat);
  const latMin = Math.floor((absLat - latDeg) * 60);
  const latSec = ((absLat - latDeg - latMin / 60) * 3600).toFixed(1);

  const lngDeg = Math.floor(absLng);
  const lngMin = Math.floor((absLng - lngDeg) * 60);
  const lngSec = ((absLng - lngDeg - lngMin / 60) * 3600).toFixed(1);

  return `${latDeg}°${latMin}'${latSec}"${latDir} ${lngDeg}°${lngMin}'${lngSec}"${lngDir}`;
}

// ── Generate realistic toilet numbers ────────────────────────────────────────

function generateToiletNumbers(area: typeof areas[number]) {
  // Use a base number range per area so they look realistic
  const bases: Record<string, number> = {
    'ar-001': 98,
    'ar-002': 106,
    'ar-003': 114,
    'ar-004': 144,
    'ar-005': 304,
    'ar-006': 354,
    'ar-007': 414,
    'ar-008': 424,
    'ar-009': 464,
    'ar-010': 467,
    'ar-011': 537,
    'ar-012': 617,
    'ar-013': 676,
    'ar-014': 484,
    'ar-015': 507,
    'ar-016': 508,
    'ar-017': 651,
    'ar-018': 661,
  };
  const base = bases[area.id] ?? 1;
  return Array.from({ length: area.toiletCount }, (_, i) => base + i);
}

// ── A4 GPS Coordinates Document ──────────────────────────────────────────────

export function CoordinatesDocument({
  allocationId,
  invoiceId,
}: {
  allocationId: string;
  /** Pin the document to a specific invoice's period (e.g. from the Document Bundle).
   *  Falls back to the allocation's latest invoice when omitted. */
  invoiceId?: string;
}) {
  const allocation = allocations.find((a) => a.id === allocationId);
  if (!allocation) return null;

  const allocationAreas = areas.filter((a) => a.allocationId === allocationId);
  const region = regions.find((r) => r.id === allocation.regionId);

  // Selected invoice for this allocation → signature date
  const allocInvoices = invoices
    .filter((i) => i.allocationId === allocationId)
    .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
  const selectedInvoice = (invoiceId ? invoices.find((i) => i.id === invoiceId) : undefined)
    ?? allocInvoices[0];
  const docDate = selectedInvoice?.invoiceDate ?? allocation.deliveryDate;

  // Derive service period label from the selected invoice's billing period
  const latestPeriod = billingPeriods.find((p) => p.id === selectedInvoice?.billingPeriodId);
  const servicePeriodLabel = latestPeriod
    ? `${new Date(latestPeriod.periodStart).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} TO ${new Date(latestPeriod.periodEnd).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}`
    : '';

  return (
    <div id="coordinates-document">
      {/* ── Per-area sections, each on a new page ── */}
      {allocationAreas.map((area, areaIdx) => {
        const coord = toDMS(area.lat, area.lng);
        const toiletNums = generateToiletNumbers(area);
        return (
          <div
            key={area.id}
            className="bg-white text-zinc-900 shadow-xl mx-auto"
            style={{
              width: '210mm',
              minHeight: '297mm',
              padding: '15mm 20mm',
              fontFamily: 'var(--font-inter), Arial, sans-serif',
              fontSize: '9pt',
              lineHeight: '1.5',
              pageBreakAfter: 'always',
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
                <p className="text-sm font-bold tracking-wide uppercase">GPS Coordinates</p>
                <p className="text-xs text-zinc-600 mt-0.5">{company.client}</p>
              </div>
            </div>

            {/* ── Service period header ── */}
            <p className="text-xs font-semibold text-zinc-800 mb-4">
              SERVICE PERIOD: {servicePeriodLabel}
            </p>

            {/* ── Area name heading ── */}
            <p className="text-sm font-bold text-zinc-900 mb-3 uppercase">{area.name}</p>

            {/* ── Coordinates table (matches EXACT Excel format) ── */}
            <table className="w-full text-xs border-collapse mb-4">
              <thead>
                <tr className="border-b-2 border-zinc-900">
                  <th className="text-left py-1.5 pr-3 font-semibold w-10">Number</th>
                  <th className="text-left py-1.5 pr-3 font-semibold">Toilet Number</th>
                  <th className="text-left py-1.5 font-semibold">Co-ordinates</th>
                </tr>
              </thead>
              <tbody>
                {toiletNums.map((num, i) => (
                  <tr key={i} className="border-b border-zinc-200">
                    <td className="py-1 pr-3 text-zinc-700">{i + 1}</td>
                    <td className="py-1 pr-3 font-medium">{num}</td>
                    <td className="py-1 text-zinc-700">{coord}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ── Total row ── */}
            <p className="text-xs font-semibold text-zinc-800 mb-8">
              TOTAL &nbsp;&nbsp;&nbsp;&nbsp; {area.toiletCount}
            </p>

            {/* ── Signature block (single stacked column, matches source) ── */}
            <div className="mt-12 pt-2 max-w-xs">
              <p className="text-xs font-semibold text-zinc-800 mb-4">Signatures:</p>
              <Image
                src={company.signaturePath}
                alt="Signature"
                width={120}
                height={40}
                className="object-contain"
                priority
              />
              <p className="border-t border-zinc-400 pt-0.5 mt-1 text-xs italic text-zinc-600">
                {company.name}
              </p>
              <p className="mt-4 text-xs">{fmtDate(docDate)}</p>
              <p className="border-t border-zinc-400 pt-0.5 mt-1 text-xs italic text-zinc-600">Date</p>

              <p className="border-t border-zinc-400 pt-0.5 mt-8 text-xs italic text-zinc-600">
                City of Tshwane Official
              </p>
              <p className="border-t border-zinc-400 pt-0.5 mt-8 text-xs italic text-zinc-600">Date</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function CoordinatesDetailPage({
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
          href="/service-notes"
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
          <CoordinatesDocument allocationId={id} />
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
          nav, header, footer, aside, .print\:hidden { display: none !important; }
          #coordinates-document { display: block; }
          #coordinates-document > div {
            visibility: visible;
            box-shadow: none !important;
            position: relative;
          }
        }
      `}} />
    </main>
  );
}
