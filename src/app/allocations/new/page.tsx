'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  LayoutGrid,
  Toilet,
  Users,
  CalendarDays,
} from 'lucide-react';

// ── Shared button primitives ─────────────────────────────────────────────────
// Using plain elements styled consistently — the Button component in this
// project is @base-ui/react which does not support asChild/render-as-link.

function BtnPrimary({
  onClick,
  disabled,
  children,
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition disabled:opacity-50 disabled:pointer-events-none"
    >
      {children}
    </button>
  );
}

function BtnOutline({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition"
    >
      {children}
    </button>
  );
}

// ── Steps config ─────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Allocation meta', icon: Building2 },
  { id: 2, label: 'Area split', icon: LayoutGrid },
  { id: 3, label: 'Toilet enrollment', icon: Toilet },
  { id: 4, label: 'Staff assignment', icon: Users },
  { id: 5, label: 'Service schedule', icon: CalendarDays },
];

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-0 overflow-x-auto">
      {STEPS.map((step, idx) => {
        const done = current > step.id;
        const active = current === step.id;
        const Icon = step.icon;
        return (
          <li key={step.id} className="flex items-center shrink-0">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm select-none ${
                active
                  ? 'bg-primary text-primary-foreground font-medium'
                  : done
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground'
              }`}
            >
              {done ? (
                <Check className="w-4 h-4 text-green-500 shrink-0" />
              ) : (
                <Icon className="w-4 h-4 shrink-0" />
              )}
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{step.id}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <span className="text-muted-foreground mx-1 text-xs">›</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ── Step 1 — Allocation meta ──────────────────────────────────────────────────
function Step1({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Allocation details</h2>
        <p className="text-muted-foreground text-sm">Basic info that defines this invoicing unit.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Region</label>
          <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">Select region…</option>
            <option>Region 2</option>
            <option>Region 5</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">CoT Coordinator</label>
          <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">Select coordinator…</option>
            <option>T. Dlamini</option>
            <option>B. Nkosi</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Total toilet count</label>
          <input
            type="number"
            min={1}
            placeholder="e.g. 120"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Delivery date</label>
          <input
            type="date"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <BtnPrimary onClick={onNext}>
          Next step
          <ArrowRight className="w-4 h-4" />
        </BtnPrimary>
      </div>
    </div>
  );
}

// ── Step 2 — Area split ───────────────────────────────────────────────────────
function Step2({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [areas, setAreas] = useState([{ name: '', toilets: '' }]);

  const addArea = () => setAreas((prev) => [...prev, { name: '', toilets: '' }]);
  const removeArea = (i: number) => setAreas((prev) => prev.filter((_, idx) => idx !== i));
  const total = areas.reduce((sum, a) => sum + (parseInt(a.toilets) || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Area split</h2>
        <p className="text-muted-foreground text-sm">
          Divide the total toilet count across named areas. The sum must equal the total.
        </p>
      </div>

      <div className="space-y-3">
        {areas.map((area, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Area name</label>
              <input
                type="text"
                placeholder="e.g. Soshanguve Block A"
                value={area.name}
                onChange={(e) =>
                  setAreas((prev) =>
                    prev.map((a, idx) => (idx === i ? { ...a, name: e.target.value } : a))
                  )
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="w-32 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Toilets</label>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={area.toilets}
                onChange={(e) =>
                  setAreas((prev) =>
                    prev.map((a, idx) => (idx === i ? { ...a, toilets: e.target.value } : a))
                  )
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            {areas.length > 1 && (
              <button
                type="button"
                onClick={() => removeArea(i)}
                className="mt-6 p-2 text-muted-foreground hover:text-destructive transition"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={addArea}
          className="text-sm text-muted-foreground hover:text-foreground transition"
        >
          + Add area
        </button>
        <span
          className={`text-sm font-medium ${
            total === 0
              ? 'text-muted-foreground'
              : 'text-green-600 dark:text-green-400'
          }`}
        >
          Total: {total} toilets
        </span>
      </div>

      <div className="flex justify-between pt-4">
        <BtnOutline onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </BtnOutline>
        <BtnPrimary onClick={onNext}>
          Next step
          <ArrowRight className="w-4 h-4" />
        </BtnPrimary>
      </div>
    </div>
  );
}

// ── Step 3 — Toilet enrollment ────────────────────────────────────────────────
function Step3({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Toilet enrollment</h2>
        <p className="text-muted-foreground text-sm">
          Enter toilet numbers, GPS coordinates, and type for each area.
        </p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-3 bg-muted/40 border-b border-border flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Area: Soshanguve Block A</span>
          <span className="text-xs text-muted-foreground">40 toilets</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Toilet #</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Latitude</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Longitude</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Type</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((n) => (
                <tr key={n} className="border-b border-border last:border-0">
                  <td className="px-4 py-2">
                    <input
                      placeholder={`T-00${n}`}
                      className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      placeholder="-25.7479"
                      className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      placeholder="28.1878"
                      className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select className="rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                      <option value="STANDARD">Standard</option>
                      <option value="DISABLED">Disabled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border">
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground transition"
          >
            + Add row
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        You can also paste data from Excel — each row: toilet number, latitude, longitude, type.
      </p>

      <div className="flex justify-between pt-4">
        <BtnOutline onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </BtnOutline>
        <BtnPrimary onClick={onNext}>
          Next step
          <ArrowRight className="w-4 h-4" />
        </BtnPrimary>
      </div>
    </div>
  );
}

// ── Step 4 — Staff assignment ─────────────────────────────────────────────────
function Step4({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Staff assignment</h2>
        <p className="text-muted-foreground text-sm">
          Assign one site coordinator (exclusive per area) and cleaners. Soft target: ~1 per 10 toilets.
        </p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-3 bg-muted/40 border-b border-border">
          <span className="text-sm font-medium text-foreground">Area: Soshanguve Block A</span>
        </div>
        <div className="p-5 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Site coordinator</label>
            <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select coordinator…</option>
              <option>M. Sithole</option>
              <option>P. Mokoena</option>
            </select>
            <p className="text-xs text-muted-foreground">
              A coordinator can only be assigned to one area at a time.
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Cleaners</label>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((n) => (
                <input
                  key={n}
                  placeholder={`Cleaner ${n} full name`}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-2">
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground transition"
              >
                + Add cleaner
              </button>
              <span className="text-xs text-amber-600 dark:text-amber-400">
                4 cleaners for 40 toilets — recommended: 4
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <BtnOutline onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </BtnOutline>
        <BtnPrimary onClick={onNext}>
          Next step
          <ArrowRight className="w-4 h-4" />
        </BtnPrimary>
      </div>
    </div>
  );
}

// ── Step 5 — Service schedule ─────────────────────────────────────────────────
function Step5({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (day: string) =>
    setSelected((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : prev.length < 2
        ? [...prev, day]
        : prev
    );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Service schedule</h2>
        <p className="text-muted-foreground text-sm">
          Pick exactly 2 weekdays. This schedule applies to the whole allocation.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {WEEKDAYS.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => toggle(day)}
            className={`px-5 py-3 rounded-xl border text-sm font-medium transition ${
              selected.includes(day)
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:bg-muted'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {selected.length === 2 ? (
        <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg px-4 py-3">
          <Check className="w-4 h-4 shrink-0" />
          Service days set: {selected.join(' & ')}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {selected.length === 0 ? 'Select 2 weekdays.' : 'Select 1 more weekday.'}
        </p>
      )}

      <div className="flex justify-between pt-4">
        <BtnOutline onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </BtnOutline>
        <BtnPrimary onClick={onComplete} disabled={selected.length < 2}>
          <Check className="w-4 h-4" />
          Complete setup
        </BtnPrimary>
      </div>
    </div>
  );
}

// ── Done ──────────────────────────────────────────────────────────────────────
function Done() {
  return (
    <div className="text-center py-12 space-y-4">
      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">Allocation complete!</h2>
      <p className="text-muted-foreground text-sm max-w-xs mx-auto">
        All 5 steps are done. This allocation is now ready to be invoiced.
      </p>
      <div className="flex items-center justify-center gap-3 pt-4">
        <Link
          href="/allocations"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition"
        >
          View all allocations
        </Link>
        <Link
          href="/allocations/new"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition"
        >
          New allocation
        </Link>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function NewAllocationPage() {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);

  return (
    <main className="flex-1 p-8">
      <div className="max-w-3xl">
        <Link
          href="/allocations"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Allocations
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-1">New allocation</h1>
        <p className="text-muted-foreground mb-8">
          5-step setup — each step is saved independently and can be resumed later.
        </p>

        {!done && (
          <div className="mb-8">
            <StepIndicator current={step} />
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card p-8">
          {done ? (
            <Done />
          ) : step === 1 ? (
            <Step1 onNext={() => setStep(2)} />
          ) : step === 2 ? (
            <Step2 onNext={() => setStep(3)} onBack={() => setStep(1)} />
          ) : step === 3 ? (
            <Step3 onNext={() => setStep(4)} onBack={() => setStep(2)} />
          ) : step === 4 ? (
            <Step4 onNext={() => setStep(5)} onBack={() => setStep(3)} />
          ) : (
            <Step5 onComplete={() => setDone(true)} onBack={() => setStep(4)} />
          )}
        </div>

        {!done && (
          <p className="mt-4 text-xs text-muted-foreground text-center">
            Step {step} of {STEPS.length} — you can skip steps and come back to them later
          </p>
        )}
      </div>
    </main>
  );
}
