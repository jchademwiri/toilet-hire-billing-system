'use client';

import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { downloadElementPdf, downloadServerPdf } from '@/engine/pdf/client-pdf';

interface ExportPdfButtonProps {
  /** File name for the downloaded PDF (without .pdf extension) */
  fileName?: string;
  /** Button label text */
  label?: string;
  /**
   * Client-side mode: ID of the DOM element to capture as PDF.
   * The element (e.g. an A4Page) will be rendered via html2canvas + jsPDF.
   */
  elementId?: string;
  /**
   * Server-side mode: URL of the API route that returns a PDF.
   * If set, takes priority over elementId.
   * Example: `/api/billing/pdf/invoice/inv-006`
   */
  pdfUrl?: string;
}

export function ExportPdfButton({
  fileName = 'document.pdf',
  label = 'Export PDF',
  elementId,
  pdfUrl,
}: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    if (!elementId && !pdfUrl) {
      console.warn('ExportPdfButton: provide either elementId or pdfUrl.');
      return;
    }

    setIsExporting(true);

    try {
      if (pdfUrl) {
        await downloadServerPdf(pdfUrl, fileName);
      } else if (elementId) {
        await downloadElementPdf(elementId, fileName);
      }
    } catch (error) {
      console.error('PDF export failed:', error);
      // Error is logged. The button re-enables so the user can retry.
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || (!elementId && !pdfUrl)}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-background text-sm font-medium text-foreground hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition disabled:opacity-50 disabled:pointer-events-none"
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
      ) : (
        <FileDown className="w-4 h-4 text-amber-500" />
      )}
      {isExporting ? 'Exporting...' : label}
    </button>
  );
}
