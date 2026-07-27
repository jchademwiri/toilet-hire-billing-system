import Image from 'next/image';
import { contract } from '@/lib/mock-data';
import { company } from '@/config/company';

// ── Shared document header ───────────────────────────────────────────────────
// Every printable document opens with this exact letterhead + title bar —
// only the `title` text changes between documents, never the layout or
// colors, so every printout reads as part of the same set.

export function DocumentHeader({ title }: { title: string }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-start pb-3 mb-3">
        <div className="text-xs text-zinc-600 leading-snug">
          <p className="text-sm font-bold text-zinc-800">{title}</p>
          <p className="font-semibold text-zinc-800 mt-1">{company.name.toUpperCase()}</p>
          <p>VAT No: {contract.vatNumber}</p>
          {contract.addressLines.map((line) => <p key={line}>{line}</p>)}
        </div>
        <Image
          src={company.logoPath}
          alt={company.shortName}
          width={100}
          height={46}
          className="object-contain shrink-0"
          priority
        />
      </div>
      <div className="flex justify-between items-center bg-zinc-100 border border-zinc-200 px-4 py-2">
        <h2 className="text-sm font-bold tracking-wide text-zinc-700">{company.name.toUpperCase()}</h2>
        <p className="text-sm font-bold text-zinc-700">{title}</p>
      </div>
    </div>
  );
}
