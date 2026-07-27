import { sageSyncLog, invoices, fmt, fmtDate } from '@/lib/mock-data';
import { Send, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

function SyncStatusBadge({ status }: { status: string }) {
  if (status === 'SUCCESS') return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
      <CheckCircle2 className="w-3 h-3" />Success
    </span>
  );
  if (status === 'FAILED') return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
      <XCircle className="w-3 h-3" />Failed
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
      <AlertCircle className="w-3 h-3" />Rejected
    </span>
  );
}

export default function SageSyncPage() {
  const enriched = sageSyncLog.map((log) => {
    const invoice = invoices.find((i) => i.id === log.invoiceId);
    return { ...log, invoice };
  });

  const successCount = sageSyncLog.filter((l) => l.status === 'SUCCESS').length;
  const failedCount = sageSyncLog.filter((l) => l.status === 'FAILED').length;

  return (
    <main className="flex-1 p-8">
      <div className="max-w-5xl space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Sage Sync Log</h1>
          <p className="text-muted-foreground text-sm">
            Audit trail for every invoice push to Sage — amounts sent, responses received, status.
          </p>
        </div>

        {/* Phase notice */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-muted border border-border text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            <strong className="text-foreground">Phase 5 feature.</strong> Full Sage API integration is deferred. In the interim, invoice numbers are entered manually. This log shows sync attempts once the integration is live.
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total sync attempts', value: sageSyncLog.length.toString() },
            { label: 'Successful', value: successCount.toString() },
            { label: 'Failed', value: failedCount.toString() },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-border bg-card px-5 py-4">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {/* Log table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Send className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Sync history</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoice #</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Allocation</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount sent</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Synced at</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {enriched.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30 transition">
                  <td className="px-5 py-3.5 font-medium text-foreground">
                    {log.invoiceNumber ?? <span className="italic text-muted-foreground text-xs">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{log.invoice?.allocationName ?? '—'}</td>
                  <td className="px-5 py-3.5 text-right font-medium text-foreground">
                    {log.newGross ? fmt(log.newGross) : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {fmtDate(log.syncedAt.split('T')[0])}
                    <span className="ml-1 text-xs text-muted-foreground/70">
                      {log.syncedAt.split('T')[1]?.slice(0, 5)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5"><SyncStatusBadge status={log.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
