import type { CSSProperties, ReactNode } from 'react';

// ── Shared A4 document preview wrapper ───────────────────────────────────────
// Every printable document (invoice, service notes, schedules, EPWP list,
// coordinates, statement) renders inside this so page size, padding, and
// typography stay identical across the app and only need to change in one
// place.

const SIZE: Record<'portrait' | 'landscape', { width: string; minHeight: string }> = {
  portrait: { width: '210mm', minHeight: '297mm' },
  landscape: { width: '297mm', minHeight: '210mm' },
};

export function A4Page({
  id,
  orientation = 'portrait',
  fontSize = '9pt',
  pageBreakAfter = false,
  className = '',
  style,
  children,
}: {
  id?: string;
  orientation?: 'portrait' | 'landscape';
  fontSize?: string;
  /** Set when this page is one of several stacked in sequence (e.g. per-area
   *  coordinate pages) and each must force a new printed page after it. */
  pageBreakAfter?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      id={id}
      className={['bg-white text-zinc-900 shadow-xl mx-auto', className].filter(Boolean).join(' ')}
      style={{
        ...SIZE[orientation],
        padding: '15mm 20mm',
        fontFamily: 'var(--font-inter), Arial, sans-serif',
        fontSize,
        lineHeight: '1.5',
        display: 'flex',
        flexDirection: 'column',
        ...(pageBreakAfter ? { pageBreakAfter: 'always' } : null),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
