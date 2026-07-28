import {
  allocations, areas, invoices, billingPeriods, serviceSchedules,
  contract, fmtDate,
} from '@/lib/mock-data';
import { company } from '@/config/company';
import { computeServiceDates } from '@/engine/pdf';
import Image from 'next/image';
import { A4Page } from './A4Page';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';

// ── A4 Service Notes Document (EXACT Excel format) ──────────────────────────

export function ServiceNotesDocument({
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

  // Selected invoice for this allocation → signature/document date + period label
  const allocInvoices = invoices
    .filter((i) => i.allocationId === allocationId)
    .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
  const selectedInvoice = (invoiceId ? invoices.find((i) => i.id === invoiceId) : undefined)
    ?? allocInvoices[0];
  const docDate = selectedInvoice?.invoiceDate ?? allocation.deliveryDate;
  const latestPeriod = billingPeriods.find((p) => p.id === selectedInvoice?.billingPeriodId);

  // Compute service dates using the engine function
  const schedule = serviceSchedules.find((s) => s.allocationId === allocationId);
  const serviceDates = schedule && latestPeriod
    ? computeServiceDates(schedule.day1, schedule.day2, latestPeriod.periodStart, latestPeriod.periodEnd)
    : [];

  return (
    <A4Page id="service-notes-document" orientation="landscape">
      <DocumentHeader title="SERVICE NOTES" context={allocation.regionName} />

      {/* ── Contract line ── */}
      <div className="text-xs text-zinc-700 leading-snug mb-4">
        <p>{company.client}</p>
        <p>Hiring and Servicing of chemical toilets</p>
        <p>{contract.reference}</p>
        <p className="font-semibold text-zinc-900 mt-1">
          Service Notes (From {latestPeriod ? fmtDate(latestPeriod.periodStart) : '—'} To{' '}
          {latestPeriod ? fmtDate(latestPeriod.periodEnd) : '—'})
        </p>
      </div>

      {/* ── Main table: one column per actual service date ── */}
      <table className="w-full text-xs border-collapse mb-8">
        <thead>
          <tr className="bg-zinc-100">
            <th className="text-left py-1.5 px-2 font-semibold border border-zinc-300">TOWNSHIP / INFORMAL SETTLEMENT</th>
            <th className="text-center py-1.5 px-2 font-semibold border border-zinc-300">Qty (Units)</th>
            {serviceDates.map((d) => (
              <th key={d.date} className="text-center py-1.5 px-2 font-semibold border border-zinc-300 whitespace-nowrap">
                {d.dayName}
              </th>
            ))}
            <th className="text-center py-1.5 px-2 font-semibold border border-zinc-300 whitespace-nowrap">No of Service</th>
          </tr>
        </thead>
        <tbody>
          {allocationAreas.map((area) => (
            <tr key={area.id}>
              <td className="py-1 px-2 border border-zinc-200 text-zinc-800">{area.name}</td>
              <td className="py-1 px-2 border border-zinc-200 text-center">{area.toiletCount}</td>
              {serviceDates.map((d) => (
                <td key={d.date} className="py-1 px-2 border border-zinc-200 text-center whitespace-nowrap text-zinc-700">
                  {fmtDate(d.date)}
                </td>
              ))}
              <td className="py-1 px-2 border border-zinc-200 text-center font-medium">{serviceDates.length}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Signature blocks side by side ── */}
      <div className="grid grid-cols-2 gap-8 mt-8">
        <div>
          <Image
            src={company.signaturePath}
            alt="Signature"
            width={120}
            height={40}
            className="object-contain"
            priority
          />
          <p className="border-t border-zinc-400 pt-0.5 mt-1 text-xs">Service Provider Signature:</p>
          <p className="mt-4 text-xs">{fmtDate(docDate)}</p>
          <p className="border-t border-zinc-400 pt-0.5 mt-1 text-xs">Date</p>
        </div>
        <div>
          <p className="border-t border-zinc-400 pt-0.5 mt-10 text-xs">City of Tshwane Official:</p>
          <p className="border-t border-zinc-400 pt-0.5 mt-8 text-xs">Signature</p>
          <p className="border-t border-zinc-400 pt-0.5 mt-8 text-xs">Date</p>
        </div>
      </div>

      <DocumentFooter />
    </A4Page>
  );
}
