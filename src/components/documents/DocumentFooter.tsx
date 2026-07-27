import { contract } from '@/lib/mock-data';

// ── Shared document footer ───────────────────────────────────────────────────
// The same contact strip closes every printable document — identical markup
// and colors everywhere, nothing document-specific. `mt-auto` relies on
// A4Page being a flex column so this always sits pinned to the bottom of the
// page, even when a document's content is short.

export function DocumentFooter() {
  return (
    <div className="mt-auto pt-2 border-t border-zinc-200 text-[10px] text-zinc-500 flex justify-between">
      <span>{contract.email}</span>
      <span>{contract.website}</span>
      <span>{contract.tel}</span>
    </div>
  );
}
