// ── Shared print styles for A4 document pages ────────────────────────────────
// Delegates the actual CSS generation to engine/pdf/print-styles so the
// same CSS strings can be reused for server-side PDF generation later.

import { printStyles as genPrintStyles, bundlePrintStyles as genBundlePrintStyles } from '@/engine/pdf';

export function PrintStyles({
  targetId,
  orientation = 'portrait',
  repeatedChildren = false,
}: {
  targetId: string;
  orientation?: 'portrait' | 'landscape';
  repeatedChildren?: boolean;
}) {
  return (
    <style dangerouslySetInnerHTML={{
      __html: genPrintStyles({ targetId, orientation, repeatedChildren }),
    }} />
  );
}

export function BundlePrintStyles({ targetId }: { targetId: string }) {
  return (
    <style dangerouslySetInnerHTML={{
      __html: genBundlePrintStyles({ targetId }),
    }} />
  );
}
