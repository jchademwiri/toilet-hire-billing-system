import Link from 'next/link';
import { notFound } from 'next/navigation';
import { allocations, invoices } from '@/lib/mock-data';
import PrintButton from '@/components/PrintButton';
import DocumentSidebar from '@/components/DocumentSidebar';
import { ArrowLeft } from 'lucide-react';
import { ServiceNotesDocument } from '@/components/documents/ServiceNotesDocument';

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ServiceNotesDetailPage({
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
      <div className="max-w-[297mm] mx-auto mb-4 flex items-center justify-between print:hidden">
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
          <ServiceNotesDocument allocationId={id} />
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
          @page { margin: 0; size: A4 landscape; }
          html, body { background: white !important; margin: 0 !important; padding: 0 !important; }
          nav, header, footer, aside, .print\:hidden { display: none !important; }
          #service-notes-document {
            visibility: visible;
            box-shadow: none !important;
            position: relative;
          }
        }
      `}} />
    </main>
  );
}
