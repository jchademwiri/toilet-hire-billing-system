import {
  allocations, areas, invoices, billingPeriods, contract, fmtDate,
} from '@/lib/mock-data';
import { company } from '@/config/company';
import Image from 'next/image';
import { A4Page } from './A4Page';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';

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
      {allocationAreas.map((area) => {
        const coord = toDMS(area.lat, area.lng);
        const toiletNums = generateToiletNumbers(area);
        return (
          <A4Page key={area.id} pageBreakAfter>
            <DocumentHeader title="GPS COORDINATES" />

            {/* ── Context line ── */}
            <div className="text-xs text-zinc-600 mb-4">
              <span className="font-semibold">Contract:</span> {contract.reference} &middot;{' '}
              <span className="font-semibold">Service Period:</span> {servicePeriodLabel} &middot;{' '}
              <span className="font-semibold">Client:</span> {company.client}
            </div>

            {/* ── Area name heading ── */}
            <p className="text-sm font-bold text-zinc-900 mb-3 uppercase">{area.name}</p>

            {/* ── Coordinates table (matches EXACT Excel format) ── */}
            <table className="w-full text-xs border-collapse mb-4">
              <thead>
                <tr className="bg-zinc-100">
                  <th className="text-left py-1.5 px-2 font-semibold border border-zinc-300 w-10">Number</th>
                  <th className="text-left py-1.5 px-2 font-semibold border border-zinc-300">Toilet Number</th>
                  <th className="text-left py-1.5 px-2 font-semibold border border-zinc-300">Co-ordinates</th>
                </tr>
              </thead>
              <tbody>
                {toiletNums.map((num, i) => (
                  <tr key={i}>
                    <td className="py-1 px-2 border border-zinc-200 text-zinc-700">{i + 1}</td>
                    <td className="py-1 px-2 border border-zinc-200 font-medium">{num}</td>
                    <td className="py-1 px-2 border border-zinc-200 text-zinc-700">{coord}</td>
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

            <DocumentFooter />
          </A4Page>
        );
      })}
    </div>
  );
}
