// ── Billing PDF API route ────────────────────────────────────────────────────
// Server-side PDF generation for invoices and statements.
// Uses jsPDF to generate programmatic PDFs server-side.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { generateBillingPdf } from '@/engine/pdf/server-pdf';

type PdfType = 'invoice' | 'statement';

const SUPPORTED_TYPES = new Set<PdfType>(['invoice', 'statement']);

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const { type, id } = await params;

  if (!SUPPORTED_TYPES.has(type as PdfType)) {
    return NextResponse.json(
      { error: `Unsupported PDF type '${type}'. Supported: ${[...SUPPORTED_TYPES].join(', ')}` },
      { status: 400 },
    );
  }

  const result = await generateBillingPdf(type as PdfType, id);
  if (!result) {
    return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(result.buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${result.fileName}"`,
      'Cache-Control': 'no-store',
    },
  });
}
