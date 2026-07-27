import {
  allocations, areas, invoices, serviceSchedules, fmtDate,
} from '@/lib/mock-data';
import { company } from '@/config/company';
import Image from 'next/image';
import { A4Page } from './A4Page';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';

// ── A4 Weekly Cleaning Schedule Document (EXACT Excel format) ───────────────

export function CleaningScheduleDocument({
  allocationId,
  invoiceId,
}: {
  allocationId: string;
  /** Pin the signature date to a specific invoice (e.g. from the Document Bundle).
   *  Falls back to the allocation's latest invoice when omitted. */
  invoiceId?: string;
}) {
  const allocation = allocations.find((a) => a.id === allocationId);
  if (!allocation) return null;

  const allocationAreas = areas.filter((a) => a.allocationId === allocationId);
  const schedule = serviceSchedules.find((s) => s.allocationId === allocationId);
  const cleaningDates = schedule ? `${schedule.day1} & ${schedule.day2}` : '—';

  const allocInvoices = invoices
    .filter((i) => i.allocationId === allocationId)
    .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
  const selectedInvoice = (invoiceId ? invoices.find((i) => i.id === invoiceId) : undefined)
    ?? allocInvoices[0];
  const docDate = selectedInvoice?.invoiceDate ?? allocation.deliveryDate;

  return (
    <A4Page id="cleaning-schedule-document">
      <DocumentHeader title="WEEKLY CLEANING SCHEDULE" context={allocation.regionName} />

      {/* ── Table ── */}
      <table className="w-full text-xs border-collapse mb-10">
        <thead>
          <tr className="bg-zinc-100">
            <th className="text-left py-1.5 px-2 font-semibold border border-zinc-300">Informal Settlement Area</th>
            <th className="text-center py-1.5 px-2 font-semibold border border-zinc-300">No of Toilets</th>
            <th className="text-center py-1.5 px-2 font-semibold border border-zinc-300">Weekly Cleaning Dates</th>
          </tr>
        </thead>
        <tbody>
          {allocationAreas.map((area) => (
            <tr key={area.id}>
              <td className="py-1 px-2 border border-zinc-200 text-zinc-800">{area.name}</td>
              <td className="py-1 px-2 border border-zinc-200 text-center">{area.toiletCount}</td>
              <td className="py-1 px-2 border border-zinc-200 text-center text-zinc-700">{cleaningDates}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Signature blocks side by side ── */}
      <div className="grid grid-cols-2 gap-8 mt-8">
        <div>
          <p className="text-xs text-zinc-600 mb-1">Service Provider Official:</p>
          <Image
            src={company.signaturePath}
            alt="Signature"
            width={120}
            height={40}
            className="object-contain"
            priority
          />
          <p className="border-t border-zinc-400 pt-0.5 mt-1 text-xs">Signature</p>
          <p className="mt-4 text-xs">{fmtDate(docDate)}</p>
          <p className="border-t border-zinc-400 pt-0.5 mt-1 text-xs">Date</p>
        </div>
        <div>
          <p className="text-xs text-zinc-600 mb-1">City of Tshwane Official:</p>
          <p className="border-t border-zinc-400 pt-0.5 mt-8 text-xs">Signature</p>
          <p className="border-t border-zinc-400 pt-0.5 mt-8 text-xs">Date</p>
        </div>
      </div>

      <DocumentFooter />
    </A4Page>
  );
}
