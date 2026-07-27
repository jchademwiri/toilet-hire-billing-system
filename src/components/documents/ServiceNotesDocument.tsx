import {
  allocations, areas, invoices, billingPeriods, serviceSchedules,
  contract, fmtDate,
} from '@/lib/mock-data';
import { company } from '@/config/company';
import Image from 'next/image';

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

  // Compute the actual service dates within the latest billing period —
  // one column per date, matching the real Service Notes layout exactly.
  const schedule = serviceSchedules.find((s) => s.allocationId === allocationId);
  const dayMap: Record<string, number> = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
  };
  const dayNames = Object.fromEntries(Object.entries(dayMap).map(([name, n]) => [n, name]));
  const serviceDates: { date: string; dayName: string }[] = [];
  if (schedule && latestPeriod) {
    const targets = [dayMap[schedule.day1], dayMap[schedule.day2]].filter((d) => d !== undefined);
    // `periodStart`/`periodEnd` are YYYY-MM-DD, parsed as UTC midnight — use UTC accessors
    // throughout so the weekday and printed date stay in sync regardless of server timezone.
    const cursor = new Date(latestPeriod.periodStart);
    const end = new Date(latestPeriod.periodEnd);
    while (cursor <= end) {
      if (targets.includes(cursor.getUTCDay())) {
        serviceDates.push({
          date: cursor.toISOString().split('T')[0],
          dayName: dayNames[cursor.getUTCDay()].toUpperCase(),
        });
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1);
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
      {/* ── Letterhead ── */}
      <div className="flex justify-between items-start pb-3 mb-3">
        <div className="text-xs text-zinc-700 leading-snug">
          <p className="text-sm font-bold text-zinc-900">SERVICE NOTES</p>
          <p className="font-semibold text-zinc-900 mt-1">{company.name.toUpperCase()}</p>
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
      <div className="bg-zinc-900 text-white px-4 py-2 mb-3">
        <h1 className="text-sm font-bold tracking-wide">{company.name.toUpperCase()}</h1>
      </div>

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
          <tr className="border-b-2 border-zinc-900">
            <th className="text-left py-2 pr-3 font-semibold">TOWNSHIP / INFORMAL SETTLEMENT</th>
            <th className="text-right py-2 px-2 font-semibold">Qty (Units)</th>
            {serviceDates.map((d) => (
              <th key={d.date} className="text-center py-2 px-2 font-semibold whitespace-nowrap">
                {d.dayName}
              </th>
            ))}
            <th className="text-right py-2 pl-2 font-semibold whitespace-nowrap">No of Service</th>
          </tr>
        </thead>
        <tbody>
          {allocationAreas.map((area) => (
            <tr key={area.id} className="border-b border-zinc-200">
              <td className="py-2 pr-3 text-zinc-800">{area.name}</td>
              <td className="py-2 px-2 text-right">{area.toiletCount}</td>
              {serviceDates.map((d) => (
                <td key={d.date} className="py-2 px-2 text-center whitespace-nowrap text-zinc-700">
                  {fmtDate(d.date)}
                </td>
              ))}
              <td className="py-2 pl-2 text-right font-medium">{serviceDates.length}</td>
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
    </div>
  );
}
