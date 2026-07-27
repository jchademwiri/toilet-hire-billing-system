import Link from 'next/link';
import { ArrowLeft, LayoutDashboard, MapPin, FileText, Users, Settings } from 'lucide-react';

const quickLinks = [
  { label: 'Allocations', href: '/allocations', icon: MapPin },
  { label: 'Invoices', href: '/invoices', icon: FileText },
  { label: 'Employees', href: '/employees', icon: Users },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-lg">

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-sm">

          {/* Big 404 background number with icon layered on top */}
          <div className="relative mb-6">
            <span className="text-[9rem] font-black leading-none text-muted/60 select-none pointer-events-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center shadow-sm">
                <span className="text-2xl">🚽</span>
              </div>
            </div>
          </div>

          {/* Text */}
          <h1 className="text-2xl font-bold text-foreground mb-2">Page not found</h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-xs mx-auto">
            This page doesn&apos;t exist or may have moved. Check the URL or navigate somewhere useful.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <Link
              href="/allocations"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Allocations
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          </div>

          {/* Quick links grid */}
          <div className="border-t border-border pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">
              Quick links
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground hover:bg-muted hover:border-foreground/20 transition group"
                >
                  <Icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sub-note */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          HS 02-2025/26 · City of Tshwane Chemical Toilet Hire
        </p>
      </div>
    </main>
  );
}
