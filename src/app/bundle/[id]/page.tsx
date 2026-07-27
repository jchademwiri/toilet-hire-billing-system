import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  invoices, allocations, billingPeriods,
} from '@/lib/mock-data';
import PrintButton from '@/components/PrintButton';
import DocumentSidebar from '@/components/DocumentSidebar';
import { ArrowLeft } from 'lucide-react';
import { InvoiceDocument, computeAreaLines } from '@/app/invoices/[id]/page';
import { ServiceNotesDocument } from '@/app/service-notes/[id]/page';
import { CleaningScheduleDocument } from '@/app/cleaning-schedule/[id]/page';
import { EpwpEmployeeListDocument } from '@/app/epwp/[id]/page';
import { CoordinatesDocument } from '@/app/coordinates/[id]/page';

// ── Document Bundle / Previewer ──────────────────────────────────────────────
// Renders the full client-facing submission set for one invoice period in one
// place — Tax Invoice, Service Notes, Weekly Cleaning Schedule, EPWP Employee
// List, GPS Coordinates — so it can be reviewed and printed as a single PDF,
// matching how the real Excel workbook exports as one multi-page document.

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
      <div className="max-w-[297mm] mx-auto mb-4 flex items-center justify-between">
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
          <PrintButton />
        </div>
      </div>

      {/* ── Two-column layout: document stack + sidebar ── */}
      <div className="flex gap-6 items-start justify-center">
        <div id="document-bundle" className="shrink-0 space-y-8">
          <div className="bundle-page">
            <InvoiceDocument invoice={invoice} allocation={allocation} period={period} lines={lines} />
          </div>
          <div className="bundle-page">
            <ServiceNotesDocument allocationId={allocation.id} />
          </div>
          <div className="bundle-page">
            <CleaningScheduleDocument allocationId={allocation.id} />
          </div>
          <div className="bundle-page">
            <EpwpEmployeeListDocument allocationId={allocation.id} />
          </div>
          <div className="bundle-page">
            <CoordinatesDocument allocationId={allocation.id} />
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

      {/* ── Print styles: one section per printed page ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 0; size: A4; }
          html, body { background: white !important; margin: 0 !important; padding: 0 !important; }
          body * { visibility: hidden; }
          #document-bundle, #document-bundle * { visibility: visible; }
          #document-bundle {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .bundle-page {
            page-break-after: always;
          }
          .bundle-page:last-child {
            page-break-after: auto;
          }
        }
      `}} />
    </main>
  );
}
