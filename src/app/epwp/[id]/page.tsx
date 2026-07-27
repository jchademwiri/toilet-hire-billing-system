import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  allocations, areas, employees, employeeIdNumbers, invoices, contract, fmtDate,
} from '@/lib/mock-data';
import { company } from '@/config/company';
import Image from 'next/image';
import PrintButton from '@/components/PrintButton';
import DocumentSidebar from '@/components/DocumentSidebar';
import { ArrowLeft } from 'lucide-react';

// ── A4 EPWP Employee List Document (EXACT Excel format) ─────────────────────
//
// This is the one document in the bundle that prints the employee ID number.
// See docs/HS02-Data-Handling-POPIA.md — the ID number is sourced from the
// separate, restricted `employeeIdNumbers` table, never from `employees`.

export function EpwpEmployeeListDocument({ allocationId }: { allocationId: string }) {
  const allocation = allocations.find((a) => a.id === allocationId);
  if (!allocation) return null;

  const allocationAreas = areas.filter((a) => a.allocationId === allocationId);
  const areaNameById = Object.fromEntries(allocationAreas.map((a) => [a.id, a.name]));
  const allocationEmployees = employees.filter((e) => areaNameById[e.areaId]);

  const allocInvoices = invoices
    .filter((i) => i.allocationId === allocationId)
    .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
  const docDate = allocInvoices[0]?.invoiceDate ?? allocation.deliveryDate;

  return (
    <div
      id="epwp-document"
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
      <div className="flex justify-between items-center bg-zinc-900 text-white px-4 py-2 mb-6">
        <h1 className="text-sm font-bold tracking-wide">{company.name.toUpperCase()}</h1>
        <p className="text-sm font-bold">EPWP Employee List</p>
      </div>

      {/* ── Table ── */}
      <table className="w-full text-xs border-collapse mb-10">
        <thead>
          <tr className="border-b-2 border-zinc-900">
            <th className="text-left py-2 pr-3 font-semibold">FULLNAME</th>
            <th className="text-left py-2 px-2 font-semibold">ID NUMBER</th>
            <th className="text-left py-2 px-2 font-semibold">LOCATION</th>
            <th className="text-left py-2 pl-2 font-semibold">POSITION</th>
          </tr>
        </thead>
        <tbody>
          {allocationEmployees.map((emp) => (
            <tr key={emp.id} className="border-b border-zinc-200">
              <td className="py-2 pr-3 text-zinc-800">{emp.fullname}</td>
              <td className="py-2 px-2 text-zinc-700">{employeeIdNumbers[emp.id] ?? '—'}</td>
              <td className="py-2 px-2 text-zinc-700">{areaNameById[emp.areaId] ?? '—'}</td>
              <td className="py-2 pl-2 text-zinc-700">{emp.position}</td>
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

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function EpwpEmployeeListPage({
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
          <EpwpEmployeeListDocument allocationId={id} />
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
          #epwp-document {
            visibility: visible;
            box-shadow: none !important;
            position: relative;
          }
        }
      `}} />
    </main>
  );
}
