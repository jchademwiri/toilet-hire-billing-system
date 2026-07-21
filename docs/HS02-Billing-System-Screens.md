# HS02 Billing & Operations System — Screens

Companion to HS02-Billing-System-PRD.md and HS02-Billing-System-Spec-v3.md. This is the full
screen inventory: what each screen is for, what it shows, what actions live on it, and what data
it reads/writes. Screens are grouped in the order someone would actually move through the app.

---

## 1. Dashboard

**Purpose**: landing screen — a snapshot of the whole operation across every region/allocation.

**Shows**:
- Metric cards: active toilets, cleaners assigned, outstanding AR (total unpaid across invoices),
  next scheduled service run.
- Allocations table: region, coordinator, toilet count, onboarding status (partial/complete),
  invoice status (generated/blocked) for the current period.

**Actions**: click into an allocation row → Allocation detail; "New allocation" → onboarding wizard.

**Reads**: aggregates across `allocations`, `toilets`, `employees`, `invoices`, `serviceSchedules`.

---

## 2. Allocations list

**Purpose**: the full register of every allocation ever created, across all regions — this is the
invoicing unit, so it's the primary operational list (region is a secondary filter, not the
primary grouping).

**Shows**: table of all allocations — region, CoT coordinator, delivery date, toilet count,
onboarding status, active/inactive. Filterable by region, status.

**Actions**: open an allocation (→ detail or, if incomplete, back into the wizard at whichever step
was left off); "New allocation".

**Reads/writes**: `allocations`, joined to `regions` and `cotCoordinators`.

---

## 3. New allocation wizard

**Purpose**: the 5-step, resumable, skippable setup flow that must reach "complete" before an
allocation can be invoiced.

**Steps** (each independently saved):
1. **Allocation meta** — region, CoT coordinator, total toilet count, delivery date.
2. **Area split** — divide the total across named areas; validates that the sum equals the total.
3. **Toilet enrollment** — per area, enter toilet numbers, GPS coordinates, and type
   (standard/disabled); validates every toilet has non-empty coordinates.
4. **Coordinator & employee assignment** — one site coordinator per area (exclusive, never shared),
   plus cleaners; soft warning (not a block) if cleaner count deviates far from ~1:10.
5. **Service schedule** — pick 2 weekdays, once for the whole allocation (not per area).

**Shows**: step progress tracker, per-step forms, a running completeness indicator.

**Actions**: save-and-continue per step, skip a step, jump back to an earlier step, mark complete.

**Writes**: `allocations`, `areas`, `toilets`, `employees`, `serviceSchedules`.

---

## 4. Allocation detail

**Purpose**: the ongoing management view for an allocation after onboarding — this is where
day-to-day changes happen, not the wizard.

**Shows**: allocation summary (region, coordinator, delivery date, total toilets), area breakdown,
toilet list per area, current service schedule, history of changes.

**Actions**:
- Add/remove a toilet (sets `installedOn`/`removedOn` — never hard-deletes, so past invoices stay
  correct).
- Log a relocation (toilet moves from one area to another, with a date — feeds the relocation
  billing line).
- Update the service schedule (creates a new schedule row with its own `effectiveFrom`, preserving
  the old one for historical billing periods).
- Reassign a site coordinator or update employees.

**Reads/writes**: `allocations`, `areas`, `toilets`, `relocations`, `serviceSchedules`,
`employees`.

---

## 5. Billing hub

**Purpose**: the monthly (or period-based) billing action screen, per allocation.

**Shows**: period selector (defaults to the next expected cycle, including the June/July override
logic); live-calculated breakdown — days in period, service occurrences, rental amount, service
amount, VAT, gross total; onboarding-complete confirmation banner (invoicing is blocked otherwise).

**Actions**: "Generate all documents" (produces the full bundle in one step) or open the Document
bundle screen to review/print individually; "Sync to Sage" (disabled/hidden until Phase 5 exists —
in the interim, a manual invoice-number entry field instead).

**Reads**: `allocations`, `areas`, `toilets`, `serviceSchedules`, contract rates from `contracts`.
**Writes**: `billingPeriods`, `periodLines`, `invoices`.

---

## 6. Document bundle / previewer

**Purpose**: review and print the actual client-facing submission documents for one invoice.

**Shows**: tabs (or a scrollable stack) for Tax Invoice, Service Notes, Cleaning Schedule, EPWP
Employee List, GPS Coordinates — each rendered from the same underlying period data, matching the
current Excel layout.

**Actions**: print/save each document individually, or download the full bundle as one action.

**Reads**: `periodLines`, `toilets`, `employees`, `invoices` for the selected billing period.

---

## 7. Invoice list / detail

**Purpose**: the full invoice register across every allocation — separate from the Billing hub
because this is about looking back at what's been issued, not generating something new.

**Shows**: table of invoices — allocation, region, period, invoice number (manually entered until
Sage sync exists), amount, date issued, payment status.

**Actions**: open an invoice → its document bundle; manually enter/edit the invoice number field
(Phase 1–4 interim workflow); once Sage sync exists, a sync-status indicator and manual re-sync
action.

**Reads/writes**: `invoices`.

---

## 8. Statement & aging

**Purpose**: the accounts-receivable view — what's outstanding, and how overdue.

**Shows**: per-allocation and aggregate view, invoices bucketed into current / 30 / 60 / 90+ days
based on invoice date and payment status.

**Actions**: filter by region/allocation/date range; drill into an invoice.

**Reads**: `invoices`, `payments`.

---

## 9. Record payment

**Purpose**: log a payment received against an invoice. Likely a modal/drawer rather than a full
page, opened from the Invoice detail or Statement screen.

**Shows**: invoice reference, amount outstanding, a form for amount received and date.

**Writes**: `payments`.

---

## 10. Regions & coordinators

**Purpose**: manage the reference data that sits above allocations — regions, CoT (municipal)
coordinators, and site coordinators — independent of running the onboarding wizard, for
corrections after the fact (e.g. a CoT coordinator's contact details change).

**Shows**: list/edit forms for regions and coordinators.

**Reads/writes**: `regions`, `cotCoordinators`.

---

## 11. Employees

**Purpose**: the EPWP staff register — separate from the onboarding wizard's per-area assignment
step, for viewing/editing the roster directly.

**Shows**: employee list (name, position, assigned area). ID numbers are shown only in a
separate, access-restricted view given the POPIA sensitivity of that field.

**Reads/writes**: `employees` (and the separate restricted ID-number table).

---

## 12. Settings

**Purpose**: contract-wide configuration that rarely changes but needs to live somewhere editable.

**Shows**: rental rate, disabled rental rate, service rate, relocation rate, VAT percentage,
banking details, billing period override rules (the June 25–30 / July 1–25 cycle shift).

**Reads/writes**: `contracts`, `billingPeriods` (override config).

---

## 13. Sage sync log — deferred to Phase 5

**Purpose**: once Sage integration exists, the audit trail for every push — previous amount, new
amount, payload sent, response received, status. Not part of the initial build; listed here so the
screen inventory stays complete for when Phase 5 starts.

**Reads**: `sageSyncLog`, joined to `invoices`.

---

## Summary table

| # | Screen | Phase |
|---|---|---|
| 1 | Dashboard | 1 |
| 2 | Allocations list | 1 |
| 3 | New allocation wizard | 2 |
| 4 | Allocation detail | 2 |
| 5 | Billing hub | 3 |
| 6 | Document bundle / previewer | 3 |
| 7 | Invoice list / detail | 3 |
| 8 | Statement & aging | 4 |
| 9 | Record payment | 4 |
| 10 | Regions & coordinators | 1–2 (reference data) |
| 11 | Employees | 2 (reference data) |
| 12 | Settings | 1 (reference data) |
| 13 | Sage sync log | 5 (deferred) |
