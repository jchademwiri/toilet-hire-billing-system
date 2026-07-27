// ── Shared print styles for A4 document pages ────────────────────────────────
// Every `[id]/page.tsx` that previews a single A4Page document uses the same
// @media print recipe — only the target element id and orientation differ.
// Centralising it here means page size / margins only need to change once.

export function PrintStyles({
  targetId,
  orientation = 'portrait',
  /** Set when `targetId` wraps several stacked A4 pages (e.g. one per area)
   *  rather than being the printable page itself. */
  repeatedChildren = false,
}: {
  targetId: string;
  orientation?: 'portrait' | 'landscape';
  repeatedChildren?: boolean;
}) {
  const pageSize = orientation === 'landscape' ? 'A4 landscape' : 'A4';
  const targetSelector = repeatedChildren ? `#${targetId} > div` : `#${targetId}`;

  return (
    <style dangerouslySetInnerHTML={{ __html: `
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
    `}} />
  );
}

// ── Document Bundle print styles ─────────────────────────────────────────────
// The bundle stacks multiple documents (mixed portrait/landscape) as one
// printed job, so it needs its own page-break + named @page recipe instead
// of the single-document one above.

export function BundlePrintStyles({ targetId }: { targetId: string }) {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
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
    `}} />
  );
}
