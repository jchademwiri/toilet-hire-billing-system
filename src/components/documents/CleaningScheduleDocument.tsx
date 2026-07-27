import {
  allocations, areas, invoices, serviceSchedules, contract, fmtDate,
} from '@/lib/mock-data';
import { company } from '@/config/company';
import Image from 'next/image';

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
    <div
      id="cleaning-schedule-document"
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
      {/* ── Letterhead ── */}
      <div className="flex justify-between items-start pb-3 mb-4">
        <div className="text-xs text-zinc-700 leading-snug">
          <p className="font-semibold text-zinc-900">{company.name.toUpperCase()}</p>
          <p>VAT No: {contract.vatNumber}</p>
          {contract.addressLines.map((line) => <p key={line}>{line}</p>)}
        </div>
        <Image
          src={company.logoPath}
          alt={company.shortName}
          width={90}
          height={40}
          className="object-contain shrink-0"
          priority
        />
      </div>

      {/* ── Branded title bar ── */}
      <div className="bg-zinc-900 text-white px-4 py-2 mb-6">
        <h1 className="text-sm font-bold tracking-wide">Weekly Cleaning Schedule</h1>
      </div>

      {/* ── Table ── */}
      <table className="w-full text-xs border-collapse mb-10">
        <thead>
          <tr className="border-b-2 border-zinc-900">
            <th className="text-left py-2 pr-3 font-semibold">Informal Settlement Area</th>
            <th className="text-right py-2 px-2 font-semibold">No of Toilets</th>
            <th className="text-left py-2 pl-2 font-semibold">Weekly Cleaning Dates</th>
          </tr>
        </thead>
        <tbody>
          {allocationAreas.map((area) => (
            <tr key={area.id} className="border-b border-zinc-200">
              <td className="py-2 pr-3 text-zinc-800">{area.name}</td>
              <td className="py-2 px-2 text-right">{area.toiletCount}</td>
              <td className="py-2 pl-2 text-zinc-700">{cleaningDates}</td>
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
    </div>
  );
}
