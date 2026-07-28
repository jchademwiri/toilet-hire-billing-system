// ─────────────────────────────────────────────────────────────────────────────
// Print styles — pure CSS string constants shared by every printable document.
//
// WHY:   By keeping these as plain strings instead of React components, they
//        can be injected server-side (e.g. for server-side PDF generation via
//        puppeteer or @react-pdf/renderer) without depending on the React
//        runtime.
//
// USAGE: import { printStyles, bundlePrintStyles } from '@/engine/pdf';
//        Then inject into <style> or pass to your PDF renderer of choice.
// ─────────────────────────────────────────────────────────────────────────────

/** CSS for printing a single A4 document page.
 *
 *  @param targetId - ID of the element to print (the A4 wrapper).
 *  @param orientation - 'portrait' (default) or 'landscape'.
 *  @param repeatedChildren - Set when `targetId` wraps several stacked pages
 *                            rather than being the printable element itself.
 */
export function printStyles({
  targetId,
  orientation = 'portrait',
  repeatedChildren = false,
}: {
  targetId: string;
  orientation?: 'portrait' | 'landscape';
  repeatedChildren?: boolean;
}): string {
  const pageSize = orientation === 'landscape' ? 'A4 landscape' : 'A4';
  const targetSelector = repeatedChildren ? `#${targetId} > div` : `#${targetId}`;

  return `
    @media print {
      @page { margin: 0; size: ${pageSize}; }
      html, body { background: white !important; margin: 0 !important; padding: 0 !important; }
      nav, header, footer, aside, .print\\:hidden { display: none !important; }
      ${repeatedChildren ? `#${targetId} { display: block; }` : ''}
      ${targetSelector} {
        visibility: visible;
        box-shadow: none !important;
        position: relative;
      }
    }
  `;
}

/** CSS for printing a multi-document bundle (mixed portrait/landscape pages).
 *
 *  The bundle stacks multiple documents as one printed job, requiring
 *  page-break rules and named @page directives instead of the single-document
 *  recipe above.
 */
export function bundlePrintStyles({ targetId }: { targetId: string }): string {
  return `
    @media print {
      @page { margin: 0; size: A4; }
      @page landscape { margin: 0; size: A4 landscape; }
      html, body { background: white !important; margin: 0 !important; padding: 0 !important; }
      body * { visibility: hidden; }
      #${targetId}, #${targetId} * { visibility: visible; }
      #${targetId} {
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
      .bundle-page.landscape {
        page: landscape;
      }
    }
  `;
}
