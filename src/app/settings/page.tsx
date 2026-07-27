'use client';

import { useState } from 'react';
import { contract, billingPeriods, fmtDate } from '@/lib/mock-data';
import { Settings, DollarSign, CalendarDays, Building2, Check } from 'lucide-react';

function Section({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, defaultValue, placeholder, type = 'text', note }: {
  label: string; defaultValue?: string; placeholder?: string; type?: string; note?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <main className="flex-1 p-8">
      <div className="max-w-3xl space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Settings</h1>
          <p className="text-muted-foreground text-sm">
            Contract-wide configuration — rates, VAT, banking details, and billing period overrides.
          </p>
        </div>

        {/* Contract info */}
        <Section title="Contract" icon={Building2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Contract reference" defaultValue={contract.reference} />
            <Field label="Client" defaultValue={contract.client} />
            <Field label="Start date" defaultValue={contract.startDate} type="date" />
            <Field label="End date" defaultValue={contract.endDate} type="date" />
          </div>
        </Section>

        {/* Rates */}
        <Section title="Rates (excl. VAT)" icon={DollarSign}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field
              label="Standard rental rate (per toilet per day)"
              defaultValue={contract.rentalRate.toString()}
              type="number"
              note="Confirmed: R11.50"
            />
            <Field
              label="Disabled rental rate (per toilet per day)"
              defaultValue={contract.disabledRentalRate?.toString()}
              placeholder="Not confirmed"
              type="number"
              note="Open — confirm actual rate"
            />
            <Field
              label="Service rate (per toilet per service)"
              defaultValue={contract.serviceRate.toString()}
              type="number"
              note="Confirmed: R96.50"
            />
            <Field
              label="Relocation rate"
              defaultValue={contract.relocationRate?.toString()}
              placeholder="Not confirmed"
              type="number"
              note="Open — confirm rate"
            />
            <Field
              label="VAT rate (%)"
              defaultValue={contract.vatRate.toString()}
              type="number"
              note="Confirmed: 15%"
            />
          </div>
        </Section>

        {/* Banking */}
        <Section title="Banking details" icon={Building2}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Field label="Bank name" defaultValue={contract.bankName} />
            <Field label="Account number" defaultValue={contract.accountNumber} />
            <Field label="Branch code" defaultValue={contract.branchCode} />
          </div>
        </Section>

        {/* Billing periods */}
        <Section title="Billing periods" icon={CalendarDays}>
          <p className="text-xs text-muted-foreground mb-4">
            Standard cycle: 26th of previous month → 25th of current month.
            June and July have overrides for the {contract.client} financial year-end.
          </p>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Label</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Start</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">End</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {billingPeriods.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition">
                    <td className="px-4 py-3 font-medium text-foreground">{p.label}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmtDate(p.periodStart)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmtDate(p.periodEnd)}</td>
                    <td className="px-4 py-3">
                      {p.isManualOverride ? (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          Override
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Standard</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            ⚑ Override periods (June 25–30 / July 1–25) accommodate the {contract.client} 30 June financial year-end.
            Confirm whether this recurs annually.
          </p>
        </Section>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition"
          >
            {saved ? <><Check className="w-4 h-4" />Saved</> : 'Save settings'}
          </button>
          {saved && <span className="text-xs text-green-600 dark:text-green-400">Changes saved.</span>}
        </div>
      </div>
    </main>
  );
}
