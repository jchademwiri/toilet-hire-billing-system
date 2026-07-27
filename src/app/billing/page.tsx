'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  allocations, billingPeriods, areas, serviceSchedules, contract, fmt, fmtDate,
} from '@/lib/mock-data';
import { Calculator, FileText, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';

// Compute a billing preview for an allocation + period
function computeBilling(allocationId: string, periodId: string) {
  const period = billingPeriods.find((p) => p.id === periodId);
  if (!period) return null;

  const allocationAreas = areas.filter((a) => a.allocationId === allocationId);
  const schedule = serviceSchedules.find((s) => s.allocationId === allocationId);

  const start = new Date(period.periodStart);
  const end = new Date(period.periodEnd);
  const daysInPeriod = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;

  // Count service days in period matching the scheduled weekdays
  const dayMap: Record<string, number> = {
    Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5,
  };
  let serviceDays = 0;
  if (schedule) {
    const targets = new Set([dayMap[schedule.day1], dayMap[schedule.day2]]);
    const cursor = new Date(start);
    while (cursor <= end) {
      if (targets.has(cursor.getDay())) serviceDays++;
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  const totalToilets = allocationAreas.reduce((s, a) => s + a.toiletCount, 0);
  const rentalAmount = totalToilets * daysInPeriod * contract.rentalRate;
  const serviceAmount = totalToilets * serviceDays * contract.serviceRate;
  const subtotal = rentalAmount + serviceAmount;
  const vat = subtotal * (contract.vatRate / 100);
  const gross = subtotal + vat;

  return { daysInPeriod, serviceDays, totalToilets, rentalAmount, serviceAmount, subtotal, vat, gross };
}

export default function BillingHubPage() {
  const [selectedAllocation, setSelectedAllocation] = useState(allocations[0].id);
  const [selectedPeriod, setSelectedPeriod] = useState(billingPeriods[billingPeriods.length - 1].id);

  const allocation = allocations.find((a) => a.id === selectedAllocation)!;
  const period = billingPeriods.find((p) => p.id === selectedPeriod)!;
  const billing = computeBilling(selectedAllocation, selectedPeriod);
  const canGenerate = allocation.onboardingStatus === 'COMPLETE';

  return (
    <main className="flex-1 p-8">
      <div className="max-w-4xl space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Billing hub</h1>
          <p className="text-muted-foreground text-sm">
            Calculate and generate invoices for a billing period.
          </p>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Allocation</label>
            <div className="relative">
              <select
                value={selectedAllocation}
                onChange={(e) => setSelectedAllocation(e.target.value)}
                className="w-full appearance-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring pr-8"
              >
                {allocations.map((a) => (
                  <option key={a.id} value={a.id}>{a.regionName}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Billing period</label>
            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full appearance-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring pr-8"
              >
                {billingPeriods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label} ({fmtDate(p.periodStart)} – {fmtDate(p.periodEnd)})
                    {p.isManualOverride ? ' ⚑' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Status banner */}
        {!canGenerate ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Onboarding for <strong className="mx-1">{allocation.regionName}</strong> is incomplete.
            Invoice generation is blocked until all 5 setup steps are done.
            <Link href={`/allocations/${allocation.id}`} className="underline ml-auto shrink-0">Complete setup →</Link>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-800 dark:text-green-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {allocation.regionName} is fully onboarded — ready to invoice.
          </div>
        )}

        {/* Calculation breakdown */}
        {billing && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <Calculator className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">
                Calculation — {period.label}
              </h2>
              {period.isManualOverride && (
                <span className="ml-2 px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  Override period
                </span>
              )}
            </div>

            <div className="p-6 space-y-4">
              {/* Period info */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="rounded-lg bg-muted/40 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Period</p>
                  <p className="font-medium text-foreground">
                    {fmtDate(period.periodStart)} – {fmtDate(period.periodEnd)}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/40 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Days in period</p>
                  <p className="text-2xl font-bold text-foreground">{billing.daysInPeriod}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Service occurrences</p>
                  <p className="text-2xl font-bold text-foreground">{billing.serviceDays}</p>
                </div>
              </div>

              {/* Line items */}
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Line item</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Calculation</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-3 text-foreground">Toilet rental</td>
                      <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                        {billing.totalToilets} toilets × {billing.daysInPeriod} days × {fmt(contract.rentalRate)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">{fmt(billing.rentalAmount)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-foreground">Servicing</td>
                      <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                        {billing.totalToilets} toilets × {billing.serviceDays} services × {fmt(contract.serviceRate)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">{fmt(billing.serviceAmount)}</td>
                    </tr>
                    <tr className="border-t-2 border-border bg-muted/20">
                      <td className="px-4 py-3 font-medium text-foreground">Subtotal (excl. VAT)</td>
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3 text-right font-semibold text-foreground">{fmt(billing.subtotal)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground">VAT ({contract.vatRate}%)</td>
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3 text-right text-muted-foreground">{fmt(billing.vat)}</td>
                    </tr>
                    <tr className="bg-primary/5 border-t-2 border-primary/20">
                      <td className="px-4 py-3 font-bold text-foreground">TOTAL</td>
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3 text-right font-bold text-foreground text-base">{fmt(billing.gross)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Invoice number field (manual until Sage sync) */}
              <div className="flex items-end gap-4 pt-2">
                <div className="flex-1 space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Sage invoice number
                    <span className="ml-2 text-xs font-normal text-muted-foreground">(enter after logging in Sage)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-0060"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <button
                  disabled={!canGenerate}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition disabled:opacity-50 disabled:pointer-events-none"
                >
                  <FileText className="w-4 h-4" />
                  Generate documents
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
