import { sageSyncLog, invoices, allocations, payments, fmt, fmtDate } from '@/lib/mock-data';
import { ClipboardList, CheckCircle2, XCircle, Plus, CreditCard, FileText } from 'lucide-react';

// Extended activity log combining sync data with generated events
const activities = [
  // Invoice generation events
  ...invoices.map((inv) => ({
    id: `gen-${inv.id}`,
    timestamp: `${inv.invoiceDate}T08:00:00Z`,
    action: 'Invoice generated' as const,
    detail: `${inv.invoiceNumber ?? 'Draft'} — ${inv.allocationName} — ${fmt(inv.gross)}`,
    status: inv.paymentStatus === 'PAID' ? 'success' as const : 'info' as const,
  })),
  // Sage sync events
  ...sageSyncLog.map((log) => ({
    id: `sync-${log.id}`,
    timestamp: log.syncedAt,
    action: 'Sage sync' as const,
    detail: `${log.invoiceNumber} — amount ${log.newGross ? fmt(log.newGross) : '—'}`,
    status: log.status === 'SUCCESS' ? 'success' as const : 'failed' as const,
  })),
  // Payment events — derived from mock-data payments
  ...payments.map((p) => {
    const inv = invoices.find((i) => i.id === p.invoiceId);
    return {
      id: `pay-${p.id}`,
      timestamp: `${p.receivedAt}T10:30:00Z`,
      action: 'Payment recorded' as const,
      detail: `${inv?.invoiceNumber ?? 'Unknown'} — ${fmt(p.amount)} received`,
      status: 'success' as const,
    };
  }),
  // Allocation events — derived from mock-data allocations
  ...allocations.map((a) => ({
    id: `alloc-${a.id}`,
    timestamp: `${a.deliveryDate}T09:00:00Z`,
    action: 'Allocation created' as const,
    detail: `${a.regionName} — ${a.totalToilets} toilets — delivered ${fmtDate(a.deliveryDate)}`,
    status: 'info' as const,
  })),
].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

function ActivityIcon({ action, status }: { action: string; status: string }) {
  if (action === 'Invoice generated') return <FileText className="w-4 h-4" />;
  if (action === 'Sage sync') return status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />;
  if (action === 'Payment recorded') return <CreditCard className="w-4 h-4" />;
  return <Plus className="w-4 h-4" />;
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    success: 'bg-green-500',
    failed: 'bg-red-500',
    info: 'bg-blue-500',
  };
  return <span className={`w-2 h-2 rounded-full ${colors[status] ?? 'bg-muted-foreground'} shrink-0`} />;
}

export default function AuditLogPage() {
  const successCount = activities.filter((a) => a.status === 'success').length;
  const failedCount = activities.filter((a) => a.status === 'failed').length;

  return (
    <main className="flex-1 p-8">
      <div className="max-w-4xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Audit Log</h1>
          <p className="text-muted-foreground text-sm">
            Chronological record of all system activity — invoice generation, payments, and Sage syncs.
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total events', value: activities.length.toString() },
            { label: 'Successful', value: successCount.toString() },
            { label: 'Failed', value: failedCount.toString() },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-border bg-card px-5 py-4">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {/* Activity timeline */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Activity timeline</h2>
          </div>
          <div className="divide-y divide-border">
            {activities.map((event) => (
              <div key={event.id} className="px-5 py-4 flex items-start gap-4 hover:bg-muted/30 transition group">
                <div className="mt-0.5 flex items-center justify-center w-7 h-7 rounded-full bg-muted text-muted-foreground group-hover:bg-muted/80 transition shrink-0">
                  <ActivityIcon action={event.action} status={event.status} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{event.action}</span>
                    <StatusDot status={event.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{event.detail}</p>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  {fmtDate(event.timestamp.split('T')[0])}
                  <span className="ml-1 text-muted-foreground/60">
                    {event.timestamp.split('T')[1]?.slice(0, 5)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
