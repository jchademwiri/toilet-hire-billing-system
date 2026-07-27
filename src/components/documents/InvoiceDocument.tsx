import { invoices, allocations, billingPeriods, contract, fmt, fmtDate } from '@/lib/mock-data';
import { company } from '@/config/company';
import Image from 'next/image';
import type { AreaLine } from '@/engine/invoice-lines';
import { computeInvoiceTotals } from '@/engine/invoice-totals';
import { A4Page } from './A4Page';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';

// ── Invoice Document (A4 preview, EXACT Excel format) ────────────────────────

export function InvoiceDocument({
  invoice,
  allocation,
  period,
  lines,
}: {
  invoice: typeof invoices[number];
  allocation: typeof allocations[number] | undefined;
  period: typeof billingPeriods[number] | undefined;
  lines: AreaLine[];
}) {
  const { totalRental, totalService, subtotal, vat, gross } = computeInvoiceTotals(lines);

  return (
    <A4Page id="invoice-document">
      <DocumentHeader title="TAX INVOICE" context={allocation?.regionName} />

      {/* ── Contact details (provider) + invoice meta ── */}
      <div className="flex justify-between items-start text-xs mb-4">
        <div className="grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5 text-zinc-700">
          <span className="text-zinc-500">Tel:</span>
          <span>{contract.tel}</span>
          <span className="text-zinc-500">Cell:</span>
          <span>{contract.cell}</span>
          <span className="text-zinc-500">Email:</span>
          <span>{contract.email}</span>
          <span className="text-zinc-500">Website:</span>
          <span>{contract.website}</span>
        </div>
        <div className="text-right shrink-0">
          <div className="grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5">
            <span className="text-zinc-500">Tax Invoice No:</span>
            <span className="font-semibold">{invoice.invoiceNumber ?? '—'}</span>
            <span className="text-zinc-500">Invoice Date:</span>
            <span>{fmtDate(invoice.invoiceDate)}</span>
            <span className="text-zinc-500">Service Period:</span>
            <span>{period ? `${fmtDate(period.periodStart)} To ${fmtDate(period.periodEnd)}` : '—'}</span>
            <span className="text-zinc-500">Region:</span>
            <span>{allocation?.regionName ?? '—'}</span>
          </div>
        </div>
      </div>

      {/* ── Bill to (client) + registration details (provider) ── */}
      <div className="flex justify-between items-start text-xs mb-6">
        <div className="text-zinc-700 leading-snug">
          <p className="font-bold text-zinc-900">BILL TO:</p>
          <p>{company.client}</p>
          {contract.clientAddressLines.map((line) => <p key={line}>{line}</p>)}
          <p className="mt-1">VAT Number: {contract.clientVatNumber}</p>
          <p>Tel: {contract.clientTel}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-zinc-900 mb-1">REGISTRATION:</p>
          <div className="grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5 text-zinc-700">
            <span className="text-zinc-500">VAT Number:</span>
            <span>{contract.vatNumber}</span>
            <span className="text-zinc-500">Vendor No:</span>
            <span>{contract.vendorNumber}</span>
            <span className="text-zinc-500">Reg No:</span>
            <span>{contract.regNo}</span>
            <span className="text-zinc-500">Contract Ref:</span>
            <span>{contract.reference}</span>
          </div>
        </div>
      </div>

      {/* ── Per-area breakdown table ── */}
      <table className="w-full text-xs border-collapse mb-4">
        <thead>
          <tr className="bg-zinc-100">
            <th rowSpan={2} className="text-left py-1.5 px-2 font-semibold border border-zinc-300 align-bottom">#</th>
            <th rowSpan={2} className="w-[28%] text-left py-1.5 px-2 font-semibold border border-zinc-300 align-bottom">
              TOWNSHIP / INFORMAL SETTLEMENT
            </th>
            <th colSpan={3} className="text-center py-1 px-2 font-semibold border border-zinc-300">
              RENTALS &amp; RELOCATIONS
            </th>
            <th colSpan={2} className="text-center py-1 px-2 font-semibold border border-zinc-300">SERVICE</th>
            <th rowSpan={2} className="text-right py-1.5 px-2 font-semibold border border-zinc-300 align-bottom">
              SUB TOTALS
            </th>
          </tr>
          <tr className="bg-zinc-100">
            <th className="w-12 text-center py-1 px-2 font-medium border border-zinc-300">Qty (Units)</th>
            <th className="w-12 text-center py-1 px-2 font-medium border border-zinc-300">Days in Period</th>
            <th className="text-right py-1 px-2 font-medium border border-zinc-300">
              Rental Amount R{contract.rentalRate.toFixed(2)}
            </th>
            <th className="w-12 text-center py-1 px-2 font-medium border border-zinc-300">No of Services</th>
            <th className="text-right py-1 px-2 font-medium border border-zinc-300">
              Service Amount R{contract.serviceRate.toFixed(2)}
            </th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.idx}>
              <td className="py-1 px-2 border border-zinc-200 text-zinc-600">{line.idx}</td>
              <td className="py-1 px-2 border border-zinc-200">{line.name}</td>
              <td className="py-1 px-2 border border-zinc-200 text-center">{line.qty}</td>
              <td className="py-1 px-2 border border-zinc-200 text-center">{line.days}</td>
              <td className="py-1 px-2 border border-zinc-200 text-right">{fmt(line.rentalAmount)}</td>
              <td className="py-1 px-2 border border-zinc-200 text-center">{line.services}</td>
              <td className="py-1 px-2 border border-zinc-200 text-right">{fmt(line.serviceAmount)}</td>
              <td className="py-1 px-2 border border-zinc-200 text-right font-medium">{fmt(line.subtotal)}</td>
            </tr>
          ))}
          <tr className="bg-zinc-100 font-semibold">
            <td colSpan={2} className="py-1.5 px-2 border border-zinc-300">Sub Totals</td>
            <td className="py-1.5 px-2 border border-zinc-300 text-center">
              {lines.reduce((s, l) => s + l.qty, 0)}
            </td>
            <td className="py-1.5 px-2 border border-zinc-300" />
            <td className="py-1.5 px-2 border border-zinc-300 text-right">{fmt(totalRental)}</td>
            <td className="py-1.5 px-2 border border-zinc-300" />
            <td className="py-1.5 px-2 border border-zinc-300 text-right">{fmt(totalService)}</td>
            <td className="py-1.5 px-2 border border-zinc-300 text-right">{fmt(subtotal)}</td>
          </tr>
        </tbody>
      </table>

      {/* ── Totals ── */}
      <div className="flex justify-end mb-8">
        <table className="text-xs w-72">
          <tbody>
            <tr>
              <td className="py-1.5 pr-4 text-zinc-600">VAT @ {contract.vatRate}%</td>
              <td className="py-1.5 text-right font-medium">{fmt(vat)}</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-bold">Gross Total</td>
              <td className="py-2 text-right font-bold">{fmt(gross)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Banking details + signatures ── */}
      <div className="grid grid-cols-2 gap-8 text-xs">
        <div>
          <p className="font-bold text-zinc-900 mb-1">BANKING DETAILS</p>
          <p>Account Holder: {company.name}</p>
          <p>Bank: {contract.bankName}</p>
          <p>Account Number: {contract.accountNumber}</p>
          <p>Branch Code: {contract.branchCode}</p>

          <div className="mt-8">
            <Image
              src={company.signaturePath}
              alt="Signature"
              width={110}
              height={38}
              className="object-contain"
              priority
            />
            <p className="border-t border-zinc-400 pt-0.5 mt-1">Service Provider Signature:</p>
            <p className="mt-3">{fmtDate(invoice.invoiceDate)}</p>
            <p className="border-t border-zinc-400 pt-0.5 mt-1">Date:</p>
          </div>
        </div>
        <div>
          <div className="mt-8">
            <p className="border-t border-zinc-400 pt-0.5 mt-10">City of Tshwane Official:</p>
            <p className="border-t border-zinc-400 pt-0.5 mt-8">Signature:</p>
            <p className="border-t border-zinc-400 pt-0.5 mt-8">Date:</p>
          </div>
        </div>
      </div>

      <DocumentFooter />
    </A4Page>
  );
}
