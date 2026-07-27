'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  ClipboardCheck,
  ClipboardList,
  Users,
  MapPin,
  CalendarDays,
  TrendingUp,
  ChevronRight,
  ExternalLink,
  Layers,
} from 'lucide-react';

interface DocLinkProps {
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
  isActive: boolean;
}

function DocLink({ label, href, icon, description, isActive }: DocLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-start gap-3 px-4 py-3 transition group ${
        isActive
          ? 'bg-primary/5 text-primary'
          : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
      }`}
    >
      <span className={`mt-0.5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-medium ${isActive ? 'text-primary' : ''}`}>
            {label}
          </span>
          {isActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground/70 truncate">{description}</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition self-center" />
    </Link>
  );
}

interface DocumentSidebarProps {
  allocationId: string;
  /** If specified, highlight the invoice for this ID as active */
  activeInvoiceId?: string;
  /** If provided, render invoice links scoped to this allocation */
  allocationInvoiceIds?: string[];
}

export default function DocumentSidebar({
  allocationId,
  activeInvoiceId,
  allocationInvoiceIds,
}: DocumentSidebarProps) {
  const pathname = usePathname();

  // Build the best invoice link href — prefer activeInvoiceId, fall back to first in list
  const invoiceHref = activeInvoiceId
    ? `/invoices/${activeInvoiceId}`
    : (allocationInvoiceIds?.[0] ? `/invoices/${allocationInvoiceIds[0]}` : null);

  // Bundle is keyed off an invoice period too — prefer the active one, else the first available
  const bundleInvoiceId = activeInvoiceId ?? allocationInvoiceIds?.[0];

  return (
    <aside className="space-y-4 print:hidden">
      {/* Document navigation */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Documents
          </h3>
        </div>
        <div className="divide-y divide-border">
          {invoiceHref && (
            <DocLink
              label="Tax Invoice"
              href={invoiceHref}
              icon={<FileText className="w-4 h-4" />}
              description="Tshwane-approved invoice format"
              isActive={pathname === invoiceHref}
            />
          )}
          <DocLink
            label="Service Notes"
            href={`/service-notes/${allocationId}`}
            icon={<ClipboardCheck className="w-4 h-4" />}
            description="Pump and clean records"
            isActive={pathname === `/service-notes/${allocationId}`}
          />
          <DocLink
            label="Cleaning Schedule"
            href={`/cleaning-schedule/${allocationId}`}
            icon={<ClipboardList className="w-4 h-4" />}
            description="Weekly cleaning dates per area"
            isActive={pathname === `/cleaning-schedule/${allocationId}`}
          />
          <DocLink
            label="EPWP Employee List"
            href={`/epwp/${allocationId}`}
            icon={<Users className="w-4 h-4" />}
            description="Fullname, ID number, location, position"
            isActive={pathname === `/epwp/${allocationId}`}
          />
          <DocLink
            label="GPS Co-ordinates"
            href={`/coordinates/${allocationId}`}
            icon={<MapPin className="w-4 h-4" />}
            description="Toilet locations per area"
            isActive={pathname === `/coordinates/${allocationId}`}
          />
          <DocLink
            label="Service Schedule"
            href={`/service-schedule/${allocationId}`}
            icon={<CalendarDays className="w-4 h-4" />}
            description="Scheduled service days"
            isActive={pathname === `/service-schedule/${allocationId}`}
          />
          <DocLink
            label="Statement"
            href={`/statement/${allocationId}`}
            icon={<TrendingUp className="w-4 h-4" />}
            description="Aging & transaction history"
            isActive={pathname === `/statement/${allocationId}`}
          />
          {bundleInvoiceId && (
            <DocLink
              label="Full Document Bundle"
              href={`/bundle/${bundleInvoiceId}`}
              icon={<Layers className="w-4 h-4" />}
              description="All documents, one print action"
              isActive={pathname === `/bundle/${bundleInvoiceId}`}
            />
          )}
        </div>
      </div>

      {/* Allocation invoicing history (if specific invoices provided) */}
      {allocationInvoiceIds && allocationInvoiceIds.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Invoices
            </h3>
          </div>
          <div className="divide-y divide-border">
            {allocationInvoiceIds.map((invId) => (
              <Link
                key={invId}
                href={`/invoices/${invId}`}
                className={`flex items-center gap-3 px-4 py-2.5 transition group ${
                  invId === activeInvoiceId
                    ? 'bg-primary/5 text-primary'
                    : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-medium truncate">{invId}</span>
                <ExternalLink className="w-3 h-3 shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
