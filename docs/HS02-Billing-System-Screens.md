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
3. **Toilet enrollment** — per area, enter toilet numbers, GPS coordinates (DMS format), and type
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
Layout matches the Tshwane-approved Excel format exactly (see `docs/excel-sheets/` for reference).

**Shows**: tabs (or a scrollable stack) for each document, rendered from the same underlying period
data:

### Tax Invoice
Approved column layout (one row per area):

| # | Location | Qty | Days | Rental Amt | Services | Service Amt | Sub Total |
|---|---|---|---|---|---|---|---|
| 1 | Themba View Ext 1 | 8 | 25 | R2,300.00 | 7 | R5,404.00 | R7,704.00 |

Footer: **Subtotal → VAT (15%) → Gross Total**. Header shows invoice number (`STP-INV-26-XXXX`),
invoice date, period, provider (Sithembe Transportation & Projects), customer (City of Tshwane),
contract reference (HS 02-2025/26), and rates (Rental R11.50, Service R96.50).

### Service Notes
Header: Customer/Vendor VAT numbers, Tender Number (HS 02–2025/26), Vendor Number (101776).
Table columns: Region Number | Site Name | Comments.
Footer: Signature block with Service Provider (name, surname, signature, date) and
Site Coordinator (name, surname, signature, date).

### Weekly Cleaning Schedule
Table: Informal Settlement Area | No of Toilets | Weekly Cleaning Dates (e.g. "Monday & Thursday").
Footer: Service Provider Official / City of Tshwane Official signature blocks. Built at
`src/app/cleaning-schedule/[id]/page.tsx`.

### EPWP Employee List
Table: Fullname | ID Number | Location | Position. Built at `src/app/epwp/[id]/page.tsx` — this is
the one document that prints the employee ID number, sourced only from the restricted
`employeeIdNumbers` lookup (see `docs/HS02-Data-Handling-POPIA.md` for why every other screen and
document keeps it out).

### GPS Coordinates
One section per area, listing: Number | Toilet Number | Co-ordinates (DMS format, e.g.
`25°23'24.7"S 28°14'53.1"E`).

**Actions**: print/save each document individually at its own route, or open `/bundle/[invoiceId]`
to print the full 5-document set as one action (built at `src/app/bundle/[id]/page.tsx`, reusing
each document's component).

**Reads**: `periodLines`, `toilets`, `employees`, `invoices` for the selected billing period.

---

## 7. Invoice list / detail

**Purpose**: the full invoice register across every allocation — separate from the Billing hub
because this is about looking back at what's been issued, not generating something new.

**Shows**: table of invoices — allocation, region, period, invoice number (`STP-INV-26-XXXX`
format, manually entered until Sage sync exists), amount, date issued, payment status.

**Actions**: open an invoice → its document bundle; manually enter/edit the invoice number field
(Phase 1–4 interim workflow); once Sage sync exists, a sync-status indicator and manual re-sync
action.

**Reads/writes**: `invoices`.

---

## 8. Statement & aging

**Purpose**: the accounts-receivable view — what's outstanding, and how overdue. Evolved from the
basic aging report into the full **Project Statement** format matching `HS 02 Project Statement
Region.xlsx`.

**Shows**:
- **Transactions table** — Date | Invoice # | Description ("Toilet Hire and Servicing") |
  Sub Total | VAT | Total | Debit | Credit | Status
- **Aging summary** at the bottom — 90+ Days / 60 Days / 30 Days / Current / Amount Due
- Per-allocation and aggregate view, invoices bucketed by age based on invoice date and payment
  status.

**Actions**: filter by region/allocation/date range; drill into an invoice; record payment.

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
Company branding (logo text, brand name, client name, contract reference) is configured in
`src/config/company.ts`.

**Reads/writes**: `contracts`, `billingPeriods` (override config).

---

## 13. Sage sync log — deferred to Phase 5

**Purpose**: once Sage integration exists, the audit trail for every push — previous amount, new
amount, payload sent, response received, status. A working stub page already exists displaying
mock sync log data.

**Reads**: `sageSyncLog`, joined to `invoices`.

---

## 14. Audit Log

**Purpose**: a chronological record of all system activity — not just Sage syncs, but allocation
creation, invoice generation, and payment recording.

**Shows**: activity timeline with icons per action type (invoice generated, payment recorded,
Sage sync, allocation created), status indicators (success/failed/info), and timestamps. Summary
cards showing total events, successful, and failed counts.

**Actions**: scroll through the timeline; filter by event type (future enhancement).

**Reads**: `sageSyncLog`, `invoices`, `payments`, `allocations`.

---

## 15. Help

**Purpose**: user documentation and FAQ for operating the system.

**Shows**: quick-link cards to related pages (Allocations, Billing Hub, Settings, Sage Sync);
expandable FAQ accordion covering allocation setup, invoice calculation, payment recording, Sage
sync, aging reports, and settings configuration.

**Actions**: expand/collapse FAQ items; navigate to linked pages.

**Reads**: none (static content).

---

## 16. Reports

**Purpose**: detailed reporting and analytics. Currently a stub page — content deferred.

**Shows**: placeholder page with "Coming soon" notice.

**Actions**: none yet.

**Reads**: none yet.

---

## Summary table

| # | Screen | Phase | Status |
|---|---|---|---|
| 1 | Dashboard | 1 | ✅ Built |
| 2 | Allocations list | 1 | ✅ Built |
| 3 | New allocation wizard | 2 | ✅ Built |
| 4 | Allocation detail | 2 | ✅ Built |
| 5 | Billing hub | 3 | ✅ Built |
| 6 | Document bundle / previewer | 3 | ✅ Built |
| 7 | Invoice list / detail | 3 | ✅ Built |
| 8 | Statement & aging | 4 | ✅ Built (needs Project Statement update) |
| 9 | Record payment | 4 | ✅ Built |
| 10 | Regions & coordinators | 1–2 | ✅ Built |
| 11 | Employees | 2 | ✅ Built |
| 12 | Settings | 1 | ✅ Built |
| 13 | Sage sync log | 5 (deferred) | ✅ Built (stub) |
| 14 | Audit Log | 1 | ✅ Built |
| 15 | Help | 1 | ✅ Built |
| 16 | Reports | 1 | ✅ Built (stub) |
