# PRD — HS02 Billing & Operations System

**Owner**: Jacob (Sithembe Transportation and Projects)
**Status**: Draft, pre-build
**Related**: HS02-Billing-System-Spec-v3.md (technical detail lives there; this document covers
the why, the scope, and how success is judged)

---

## 1. Problem statement

STP holds a 36-month contract (HS 02-2025/26) with the City of Tshwane to hire and service
chemical toilets across multiple regions. Every month, Jacob manually assembles a submission
package per region across several Excel workbooks (invoice, service notes, cleaning schedule,
EPWP employee list, GPS coordinates), then re-keys the totals into Sage to obtain a sequential
invoice number, then copies that number back into the Excel files.

This is slow, and the two calculations that matter most — prorated rental days when toilets are
added/removed mid-month, and counting actual scheduled service dates in a period — are done by
hand and are the most common source of error. A mistake here risks over-billing the municipality,
which risks submission rejection.

## 2. Goals

1. Eliminate manual recalculation — days-in-period and service-day counts are derived
   algorithmically from dates, never typed.
2. Eliminate document drift — one set of underlying data produces the invoice, service notes, and
   coordinate/employee documents, so they can't fall out of sync with each other.
3. Keep Sage as the accounting ledger and invoice-number source without forcing Sage to produce a
   document format it can't (the itemized, per-area municipal invoice).
4. Preserve a clean audit trail suitable for a municipal client — every invoice's number, amount,
   and any later correction is traceable.
5. Reduce monthly submission-package assembly from (currently) multiple days to minutes.

## 3. Non-goals (out of scope for this build)

- Replacing Sage as the accounting system of record — Sage remains the ledger; this system feeds
  it, it doesn't replace it.
- Payroll or EPWP wage processing — employee records here are for service-schedule assignment and
  invoice documentation only, not payroll.
- Multi-contract support — this is scoped to HS 02-2025/26 specifically. A future contract could
  reuse the same schema, but that's a later decision, not a v1 requirement.

## 4. Users

- **Primary user**: Jacob — sets up allocations, runs the monthly billing cycle, generates and
  submits documents, manages Sage sync.
- **No external users in v1** — this is an internal operations tool, not a client-facing portal.
  (City of Tshwane continues to receive PDF/print documents, not system access.)

## 5. Scope — functional requirements

### 5.1 Allocation & onboarding
- Create an Allocation under a Region: total toilet count, delivery date, CoT coordinator.
- Split the allocation's toilets across Areas (must sum to the total).
- Record toilet numbers, GPS coordinates, and type (standard/disabled) per Area.
- Assign one Site Coordinator (exclusive per Area) and Cleaners per Area.
- Set a 2-weekday service schedule once per allocation.
- Track step-by-step completion status (partial/complete); gate invoice generation on completion.

### 5.2 Billing engine
- Compute days-in-period per toilet/area, handling mid-period installs/removals and the
  first-month delivery-date proration.
- Compute service occurrences by generating actual calendar dates matching the assigned weekdays
  within the period.
- Support the standard 26th–25th cycle, the June year-end override, and the July readjustment,
  via configurable (not hardcoded) period boundaries.
- Calculate rental, service, and relocation amounts, VAT, and gross total per Area, and roll up to
  the Allocation/Invoice level.

### 5.3 Document generation
- Generate the itemized client-facing Invoice, Service Notes, Cleaning Schedule, EPWP employee
  list, and GPS coordinates sheet from one shared data source per billing period.
- Support one-click generation of the full document bundle, or individual document review/print.

### 5.4 Sage integration (deferred — see §8 phasing)
- Not part of the initial build. Until built, the invoice number field is manually entered: Jacob
  re-keys the app's totals into Sage himself, gets the sequential number back, and enters it into
  the app.
- Once built, post an aggregated (≤4 line) invoice payload to Sage per Allocation per period;
  receive and store the Sage-assigned invoice number automatically instead of by hand.
- On subsequent changes to amounts, push an update to Sage (app is source of truth); log every
  sync attempt and outcome.

### 5.5 Statement & aging
- Track payments per invoice.
- Produce an aging view (current/30/60/90+) per invoice and in aggregate.

## 6. Success metrics

- Monthly submission package assembly time: days → under 5 minutes.
- Zero manual arithmetic in the shipped invoice/service-notes numbers (every number traced back to
  a stored date range and rate, not typed).
- Every invoice sent to Sage has a corresponding sync log entry.
- No invoice can be generated for an allocation whose onboarding isn't complete.

## 7. Risks & open questions

| Risk / question | Status |
|---|---|
| Disabled-unit rental rate and relocation rate unconfirmed | Open |
| Whether June/July cycle shift recurs annually or was a 2026 one-off | Open |
| Sage's exact behavior on amending a posted invoice via API | Confirmed edits are allowed; details pending |
| EPWP ID number storage under POPIA | Design decision — separate restricted table recommended |
| Excel → system data migration for existing allocations | One-time effort, not a technical risk, but needs care |

## 8. Phased delivery

1. **Foundation** — schema, seed data migrated from current Excel workbooks.
2. **Onboarding** — allocation wizard, area split, toilet/coordinate entry, employee assignment,
   schedule setup.
3. **Billing engine & documents** — calculation engine, document generation, tested against real
   July 2026 figures.
4. **Statement & aging** — payments, aging view.
5. **Sage sync (deferred)** — built only after the app above is live and tested end-to-end, not as
   part of the initial delivery.

**Interim manual workflow (Phase 1–4, before Sage sync exists)**: the invoice number field on an
`Invoice` stays editable and blank until filled in by hand. Jacob generates the invoice in the app,
manually re-enters the matching totals into Sage, then copies the Sage-assigned invoice number back
into the app. This is functionally identical to the current process, minus the error-prone manual
calculation — so the app is fully usable and already an improvement before Sage sync exists at all.
Sage sync (Phase 5) later automates exactly this round-trip, not a new workflow.
