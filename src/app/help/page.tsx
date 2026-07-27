import { LifeBuoy, FileText, BookOpen, MessageCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const faqs = [
  {
    q: 'How do I create a new allocation?',
    a: 'Go to Operations → New Allocation in the sidebar. The 5-step wizard will guide you through setting up the allocation meta, area split, toilet enrollment, staff assignment, and service schedule.',
  },
  {
    q: 'When can I generate an invoice?',
    a: 'An allocation must have a COMPLETE onboarding status before invoices can be generated. Visit the allocation detail page to check its status and complete any missing steps.',
  },
  {
    q: 'How are invoices calculated?',
    a: 'Invoices are calculated on the Billing Hub. Rental = toilets × days in period × rate. Servicing = toilets × service occurrences × rate. VAT is applied on the subtotal.',
  },
  {
    q: 'How do I record a payment?',
    a: 'Go to Payments and click "Record payment". Select the outstanding invoice, enter the amount received, and the date. The system will update the invoice status automatically.',
  },
  {
    q: 'How does Sage sync work?',
    a: 'Sage integration is a Phase 5 feature. In the interim, invoice numbers are entered manually on the Billing Hub and invoice detail page. The sync log on the Sage Sync page tracks all push attempts.',
  },
  {
    q: 'Where can I view outstanding amounts?',
    a: 'The Statement & Aging report shows all outstanding invoices bucketed by age (current, 31–60 days, 61–90 days, 90+ days). You can also see per-allocation totals on the allocation detail page.',
  },
  {
    q: 'How do I update contract rates or banking details?',
    a: 'Go to Settings to update contract info, rental/service rates, VAT rate, and banking details. All changes are saved locally in the current session.',
  },
];

export default function HelpPage() {
  return (
    <main className="flex-1 p-8">
      <div className="max-w-4xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Help & Support</h1>
          <p className="text-muted-foreground text-sm">
            Frequently asked questions and guides for using the billing system.
          </p>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Allocations', href: '/allocations', icon: FileText, desc: 'Manage toilet allocations' },
            { label: 'Billing Hub', href: '/billing', icon: BookOpen, desc: 'Generate invoices' },
            { label: 'Settings', href: '/settings', icon: LifeBuoy, desc: 'Configure rates & banking' },
            { label: 'Sage Sync', href: '/sage-sync', icon: ExternalLink, desc: 'View sync history' },
          ].map(({ label, href, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition group"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition" />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </Link>
          ))}
        </div>

        {/* FAQ accordion */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Frequently asked questions</h2>
          </div>
          <div className="divide-y divide-border">
            {faqs.map((faq, i) => (
              <details key={i} className="group">
                <summary className="px-5 py-4 text-sm font-medium text-foreground cursor-pointer hover:bg-muted/30 transition list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform shrink-0 ml-2">▼</span>
                </summary>
                <div className="px-5 pb-4 -mt-1">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
