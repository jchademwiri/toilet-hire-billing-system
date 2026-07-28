import {
  allocations, areas, invoices, billingPeriods, contract, fmtDate,
} from '@/lib/mock-data';
import { company } from '@/config/company';
import Image from 'next/image';
import { toDMS, generateToiletNumbers } from '@/engine/pdf';
import { A4Page } from './A4Page';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';

// ── A4 GPS Co-ordinates Document ─────────────────────────────────────────────

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
        const toiletNums = generateToiletNumbers(area.id, area.toiletCount);
        return (
          <A4Page key={area.id} pageBreakAfter>
            <DocumentHeader title="GPS CO-ORDINATES" context={area.name} />

            {/* ── Context line ── */}
            <div className="text-xs text-zinc-600 mb-4">
              <span className="font-semibold">Contract:</span> {contract.reference} &middot;{' '}
              <span className="font-semibold">Service Period:</span> {servicePeriodLabel} &middot;{' '}
              <span className="font-semibold">Client:</span> {company.client}
            </div>

            {/* ── Coordinates table (matches EXACT Excel format) ── */}
            <table className="w-full text-xs border-collapse mb-4">
              <thead>
                <tr className="bg-zinc-100">
                  <th className="text-center py-1.5 px-2 font-semibold border border-zinc-300 w-10">Number</th>
                  <th className="text-center py-1.5 px-2 font-semibold border border-zinc-300">Toilet Number</th>
                  <th className="text-center py-1.5 px-2 font-semibold border border-zinc-300">Co-ordinates</th>
                </tr>
              </thead>
              <tbody>
                {toiletNums.map((num, i) => (
                  <tr key={i}>
                    <td className="py-1 px-2 border border-zinc-200 text-center text-zinc-700">{i + 1}</td>
                    <td className="py-1 px-2 border border-zinc-200 text-center font-medium">{num}</td>
                    <td className="py-1 px-2 border border-zinc-200 text-center text-zinc-700">{coord}</td>
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
