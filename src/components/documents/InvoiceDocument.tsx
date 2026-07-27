import { invoices, allocations, billingPeriods, contract, fmt, fmtDate } from '@/lib/mock-data';
import { company } from '@/config/company';
import Image from 'next/image';
import type { computeAreaLines } from '@/lib/invoice-lines';
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
  lines: ReturnType<typeof computeAreaLines>;
}) {
  const totalRental = lines.reduce((s, l) => s + l.rentalAmount, 0);
  const totalService = lines.reduce((s, l) => s + l.serviceAmount, 0);
  const subtotal = totalRental + totalService;
  const vat = subtotal * (contract.vatRate / 100);
  const gross = subtotal + vat;

  return (
    <A4Page id="invoice-document">
      <DocumentHeader title="TAX INVOICE" />

      {/* ── Contact + invoice meta row ── */}
      <div className="flex justify-between items-start text-xs mb-4">
        <div className="text-zinc-700 leading-snug">
          <p>Tel: {contract.tel} &nbsp;|&nbsp; Cell: {contract.cell} &nbsp;|&nbsp; Fax: {contract.fax}</p>
          <p>Email: {contract.email} &nbsp;|&nbsp; {contract.emailAlt}</p>
          <p>VAT Number: {contract.vatNumber} &nbsp;|&nbsp; Vendor No: {contract.vendorNumber}</p>
          <p>Reg No: {contract.regNo} &nbsp;|&nbsp; {contract.website}</p>
          <p>Contract Ref: {contract.reference}</p>
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

      {/* ── Bill to ── */}
      <div className="text-xs text-zinc-700 leading-snug mb-6">
        <p className="font-bold text-zinc-900">BILL TO:</p>
        <p>{company.client}</p>
        {contract.clientAddressLines.map((line) => <p key={line}>{line}</p>)}
        <p className="mt-1">VAT Number: {contract.clientVatNumber}</p>
        <p>Tel: {contract.clientTel}</p>
      </div>

      {/* ── Per-area breakdown table ── */}
      <table className="w-full text-xs border-collapse mb-4">
        <thead>
          <tr className="bg-zinc-100">
            <th rowSpan={2} className="text-left py-1.5 px-2 font-semibold border border-zinc-300 align-bottom">#</th>
            <th rowSpan={2} className="text-left py-1.5 px-2 font-semibold border border-zinc-300 align-bottom">
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
            <th className="text-right py-1 px-2 font-medium border border-zinc-300">Qty (Units)</th>
            <th className="text-right py-1 px-2 font-medium border border-zinc-300">Days in Period</th>
            <th className="text-right py-1 px-2 font-medium border border-zinc-300">
              Rental Amount R{contract.rentalRate.toFixed(2)}
            </th>
            <th className="text-right py-1 px-2 font-medium border border-zinc-300">No of Services</th>
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
              <td className="py-1 px-2 border border-zinc-200 text-right">{line.qty}</td>
              <td className="py-1 px-2 border border-zinc-200 text-right">{line.days}</td>
              <td className="py-1 px-2 border border-zinc-200 text-right">{fmt(line.rentalAmount)}</td>
              <td className="py-1 px-2 border border-zinc-200 text-right">{line.services}</td>
              <td className="py-1 px-2 border border-zinc-200 text-right">{fmt(line.serviceAmount)}</td>
              <td className="py-1 px-2 border border-zinc-200 text-right font-medium">{fmt(line.subtotal)}</td>
            </tr>
          ))}
          <tr className="bg-zinc-100 font-semibold">
            <td colSpan={2} className="py-1.5 px-2 border border-zinc-300">Sub Totals</td>
            <td className="py-1.5 px-2 border border-zinc-300 text-right">
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
