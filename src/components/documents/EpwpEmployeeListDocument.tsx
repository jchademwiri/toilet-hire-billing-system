import {
  allocations, areas, employees, employeeIdNumbers, invoices, fmtDate,
} from '@/lib/mock-data';
import { company } from '@/config/company';
import Image from 'next/image';
import { A4Page } from './A4Page';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';

// ── A4 EPWP Employee List Document (EXACT Excel format) ─────────────────────
//
// This is the one document in the bundle that prints the employee ID number.
// See docs/HS02-Data-Handling-POPIA.md — the ID number is sourced from the
// separate, restricted `employeeIdNumbers` table, never from `employees`.

export function EpwpEmployeeListDocument({
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
  const areaNameById = Object.fromEntries(allocationAreas.map((a) => [a.id, a.name]));
  const allocationEmployees = employees.filter((e) => areaNameById[e.areaId]);

  const allocInvoices = invoices
    .filter((i) => i.allocationId === allocationId)
    .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
  const selectedInvoice = (invoiceId ? invoices.find((i) => i.id === invoiceId) : undefined)
    ?? allocInvoices[0];
  const docDate = selectedInvoice?.invoiceDate ?? allocation.deliveryDate;

  return (
    <A4Page id="epwp-document">
      <DocumentHeader title="EPWP EMPLOYEE LIST" context={allocation.regionName} />

      {/* ── Table ── */}
      <table className="w-full text-xs border-collapse mb-10">
        <thead>
          <tr className="bg-zinc-100">
            <th className="text-left py-1.5 px-2 font-semibold border border-zinc-300">FULLNAME</th>
            <th className="text-left py-1.5 px-2 font-semibold border border-zinc-300">ID NUMBER</th>
            <th className="text-left py-1.5 px-2 font-semibold border border-zinc-300">LOCATION</th>
            <th className="text-left py-1.5 px-2 font-semibold border border-zinc-300">POSITION</th>
          </tr>
        </thead>
        <tbody>
          {allocationEmployees.map((emp) => (
            <tr key={emp.id}>
              <td className="py-1 px-2 border border-zinc-200 text-zinc-800">{emp.fullname}</td>
              <td className="py-1 px-2 border border-zinc-200 text-zinc-700">{employeeIdNumbers[emp.id] ?? '—'}</td>
              <td className="py-1 px-2 border border-zinc-200 text-zinc-700">{areaNameById[emp.areaId] ?? '—'}</td>
              <td className="py-1 px-2 border border-zinc-200 text-zinc-700">{emp.position}</td>
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
