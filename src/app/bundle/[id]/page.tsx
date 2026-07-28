import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  invoices, allocations, billingPeriods,
} from '@/lib/mock-data';
import PrintButton from '@/components/PrintButton';
import { ExportPdfButton } from '@/components/ExportPdfButton';
import DocumentSidebar from '@/components/DocumentSidebar';
import { BundlePrintStyles } from '@/components/documents/PrintStyles';
import { ArrowLeft } from 'lucide-react';
import { computeAreaLines } from '@/engine';
import { InvoiceDocument } from '@/components/documents/InvoiceDocument';
import { ServiceNotesDocument } from '@/components/documents/ServiceNotesDocument';
import { CleaningScheduleDocument } from '@/components/documents/CleaningScheduleDocument';
import { EpwpEmployeeListDocument } from '@/components/documents/EpwpEmployeeListDocument';
import { CoordinatesDocument } from '@/components/documents/CoordinatesDocument';

// ── Document Bundle / Previewer ──────────────────────────────────────────────
// Renders the full client-facing submission set for one invoice period in one
// place — Tax Invoice, Service Notes, Weekly Cleaning Schedule, EPWP Employee
// List, GPS Co-ordinates — so it can be reviewed and printed as a single PDF,
// matching how the real Excel workbook exports as one multi-page document.
//
// TODO(auth): this route embeds EpwpEmployeeListDocument, so the same missing
// session/role check noted in src/app/epwp/[id]/page.tsx applies here too.

export default async function DocumentBundlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const invoice = invoices.find((i) => i.id === id);
  if (!invoice) notFound();

  const allocation = allocations.find((a) => a.id === invoice.allocationId);
  const period = billingPeriods.find((p) => p.id === invoice.billingPeriodId);
  if (!allocation) notFound();

  const lines = computeAreaLines(invoice.allocationId, invoice.billingPeriodId);

  const allocationInvoiceIds = invoices
    .filter((i) => i.allocationId === invoice.allocationId)
    .map((i) => i.id);

  return (
    <main className="flex-1 p-4 md:p-8">
      {/* ── Toolbar ── */}
      <div className="max-w-[297mm] mx-auto mb-4 flex items-center justify-between print:hidden">
        <Link
          href={`/invoices/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Invoice
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {allocation.regionName} &middot; {invoice.invoiceNumber ?? 'Draft'}
          </span>
          <ExportPdfButton
            elementId="document-bundle"
            fileName={`Bundle-${invoice.invoiceNumber ?? invoice.id}`}
            label="Download PDF"
          />
          <PrintButton />
        </div>
      </div>

      {/* ── Two-column layout: document stack + sidebar ── */}
      <div className="flex gap-6 items-start justify-center">
        <div id="document-bundle" className="shrink-0 space-y-8">
          <div className="bundle-page">
            <InvoiceDocument invoice={invoice} allocation={allocation} period={period} lines={lines} />
          </div>
          <div className="bundle-page landscape">
            <ServiceNotesDocument allocationId={allocation.id} invoiceId={id} />
          </div>
          <div className="bundle-page">
            <CleaningScheduleDocument allocationId={allocation.id} invoiceId={id} />
          </div>
          <div className="bundle-page">
            <EpwpEmployeeListDocument allocationId={allocation.id} invoiceId={id} />
          </div>
          <div className="bundle-page">
            <CoordinatesDocument allocationId={allocation.id} invoiceId={id} />
          </div>
        </div>

        {/* Right: Document sidebar */}
        <div className="w-72 space-y-4 print:hidden shrink-0">
          <DocumentSidebar
            allocationId={allocation.id}
            activeInvoiceId={id}
            allocationInvoiceIds={allocationInvoiceIds}
          />
        </div>
      </div>

      {/* Service Notes renders as a 297×210mm landscape page — BundlePrintStyles
          gives it its own named @page so it prints on landscape paper instead
          of being clipped onto the portrait A4 default. */}
      <BundlePrintStyles targetId="document-bundle" />
    </main>
  );
}
