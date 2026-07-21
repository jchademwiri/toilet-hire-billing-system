# HS02 Billing & Operations System — Technical Spec v3

Contract HS 02-2025/26 · Hiring and Servicing of Chemical Toilets · City of Tshwane
36-month contract, started March 2026, ends ~Feb 2029 (5 months lapsed at time of writing).
Possible reappointment for a further 36-month term after that.
Standalone repo (same spirit as pmg-plant-hire-calculator) — not a module inside PMG Hub or
PMG Control Center. Stack: Next.js, TypeScript, Tailwind, shadcn, Drizzle ORM, Postgres.

---

## 1. Two-document architecture

The system produces two representations of the same billing period from the same data:

1. **Client-facing documents** — Invoice, Service Notes, Toilet Coordinates, Statement — itemized
   **per Area**, matching the current Excel format (one line per township/settlement: Qty, Days in
   Period, Rental Amount, No of Services, Service Amount, Sub Total). This is what City of Tshwane
   receives.
2. **Sage sync payload** — aggregated project-wide into **up to 4 line items**: Hire of standard
   toilets, Hire of disabled toilets, Servicing, Relocation. Only non-zero lines are included.
   Sage exists purely to obtain the sequential invoice number and keep the ledger in sync — it
   never sees the per-area breakdown.

Both outputs are generated from the same `PeriodLine` records: the client document itemizes them,
the Sage payload sums them by rate-type.

---

## 2. Entity model (conceptual)

```
Contract → Region → Allocation → Area → Toilet
                        ↓           ↓
                  CoT Coordinator   ServiceSchedule (2 weekdays)
                        ↓           ↓
                    Invoice ← PeriodLine
                        ↓
                    Payment / SageSyncLog
```

- **Region** — e.g. Region 2, Region 5. A grouping/reporting label, not the invoicing unit.
- **Allocation** — a batch of toilets assigned to a region on a given delivery date. **This is the
  invoicing unit** — every new allocation gets its own invoice stream, even within a region that
  already has one running (this generalizes the Region 5 Site 1 / Leeuwfontein split, which are
  two separate allocations under one region).
- **Area** — a physical location (township/settlement) the allocation's toilets are split across.
  Each Area has exactly one Site Coordinator, never shared across Areas.
- **CoT Coordinator** — the municipal contact tied to an Allocation; a region can have several
  across its allocations.
- **ServiceSchedule** — 2 weekdays, set **once per Allocation** (region-wide within that
  allocation), not per Area — areas under the same allocation share the schedule in practice.
- **Toilet** — belongs to an Area; carries type (standard/disabled), coordinates, install/removal
  dates.
- **Invoice** — one per Allocation per billing period. Invoice number always comes from Sage;
  amount and line descriptions are owned by the app.
- **PeriodLine** — one row per Area per billing period; feeds both the client document and the
  Sage aggregate.

---

## 2.5 Data model (Drizzle ORM)

```ts
import { pgTable, uuid, varchar, doublePrecision, date, boolean, timestamp, integer } from 'drizzle-orm/pg-core';

export const contracts = pgTable('contracts', {
  id: uuid('id').defaultRandom().primaryKey(),
  reference: varchar('reference', { length: 50 }).notNull().default('HS 02-2025/26'),
  client: varchar('client', { length: 100 }).notNull().default('City of Tshwane'),
  rentalRate: doublePrecision('rental_rate').notNull().default(11.50),
  disabledRentalRate: doublePrecision('disabled_rental_rate'), // nullable until confirmed
  serviceRate: doublePrecision('service_rate').notNull().default(96.50),
  relocationRate: doublePrecision('relocation_rate'), // nullable until confirmed
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
});

export const regions = pgTable('regions', { // grouping/reporting label
  id: uuid('id').defaultRandom().primaryKey(),
  contractId: uuid('contract_id').references(() => contracts.id),
  name: varchar('name', { length: 50 }).notNull(),
});

export const cotCoordinators = pgTable('cot_coordinators', {
  id: uuid('id').defaultRandom().primaryKey(),
  regionId: uuid('region_id').references(() => regions.id),
  fullname: varchar('fullname', { length: 150 }).notNull(),
  cellphone: varchar('cellphone', { length: 20 }),
  email: varchar('email', { length: 100 }),
});

export const allocations = pgTable('allocations', { // THE invoicing unit
  id: uuid('id').defaultRandom().primaryKey(),
  regionId: uuid('region_id').references(() => regions.id),
  cotCoordinatorId: uuid('cot_coordinator_id').references(() => cotCoordinators.id),
  totalToilets: integer('total_toilets').notNull(),
  deliveryDate: date('delivery_date').notNull(),
  onboardingStatus: varchar('onboarding_status', { length: 20 }).notNull().default('IN_PROGRESS'),
});

export const areas = pgTable('areas', {
  id: uuid('id').defaultRandom().primaryKey(),
  allocationId: uuid('allocation_id').references(() => allocations.id),
  name: varchar('name', { length: 100 }).notNull(),
  siteCoordinatorId: uuid('site_coordinator_id').references(() => employees.id),
});

export const employees = pgTable('employees', { // sensitive fields (ID number) kept elsewhere
  id: uuid('id').defaultRandom().primaryKey(),
  areaId: uuid('area_id').references(() => areas.id),
  fullname: varchar('fullname', { length: 150 }).notNull(),
  position: varchar('position', { length: 30 }).notNull(), // 'Coordinator' | 'Cleaner'
});

export const toilets = pgTable('toilets', {
  id: uuid('id').defaultRandom().primaryKey(),
  areaId: uuid('area_id').references(() => areas.id),
  toiletNumber: varchar('toilet_number', { length: 30 }).notNull(),
  toiletType: varchar('toilet_type', { length: 20 }).notNull().default('STANDARD'),
  latitude: varchar('latitude', { length: 25 }).notNull(),
  longitude: varchar('longitude', { length: 25 }).notNull(),
  installedOn: date('installed_on').notNull(),
  removedOn: date('removed_on'),
});

export const relocations = pgTable('relocations', { // billable relocation events
  id: uuid('id').defaultRandom().primaryKey(),
  toiletId: uuid('toilet_id').references(() => toilets.id),
  fromAreaId: uuid('from_area_id').references(() => areas.id),
  toAreaId: uuid('to_area_id').references(() => areas.id),
  relocatedOn: date('relocated_on').notNull(),
});

export const serviceSchedules = pgTable('service_schedules', { // ONE PER ALLOCATION, not per area
  id: uuid('id').defaultRandom().primaryKey(),
  allocationId: uuid('allocation_id').references(() => allocations.id),
  day1: varchar('day_1', { length: 15 }).notNull(),
  day2: varchar('day_2', { length: 15 }).notNull(),
  effectiveFrom: date('effective_from').notNull(),
  effectiveTo: date('effective_to'),
});

export const billingPeriods = pgTable('billing_periods', {
  id: uuid('id').defaultRandom().primaryKey(),
  label: varchar('label', { length: 50 }).notNull(),
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  isManualOverride: boolean('is_manual_override').default(false),
});

export const invoices = pgTable('invoices', { // one per ALLOCATION per billing period
  id: uuid('id').defaultRandom().primaryKey(),
  allocationId: uuid('allocation_id').references(() => allocations.id),
  billingPeriodId: uuid('billing_period_id').references(() => billingPeriods.id),
  invoiceNumber: varchar('invoice_number', { length: 50 }).unique(), // Sage-assigned
  invoiceDate: date('invoice_date').notNull(),
  subtotal: doublePrecision('subtotal').notNull(),
  vat: doublePrecision('vat').notNull(),
  gross: doublePrecision('gross').notNull(),
  sageSyncedAt: timestamp('sage_synced_at'),
});

export const periodLines = pgTable('period_lines', {
  id: uuid('id').defaultRandom().primaryKey(),
  billingPeriodId: uuid('billing_period_id').references(() => billingPeriods.id),
  areaId: uuid('area_id').references(() => areas.id),
  qtyStandard: integer('qty_standard').notNull(),
  qtyDisabled: integer('qty_disabled').notNull().default(0),
  daysInPeriod: integer('days_in_period').notNull(),
  servicesInPeriod: integer('services_in_period').notNull(),
  qtyRelocated: integer('qty_relocated').notNull().default(0),
  rentalAmount: doublePrecision('rental_amount').notNull(),
  serviceAmount: doublePrecision('service_amount').notNull(),
  relocationAmount: doublePrecision('relocation_amount').notNull().default(0),
  subtotal: doublePrecision('subtotal').notNull(),
});

export const sageSyncLog = pgTable('sage_sync_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  invoiceId: uuid('invoice_id').references(() => invoices.id),
  previousGross: doublePrecision('previous_gross'),
  newGross: doublePrecision('new_gross'),
  payloadSent: varchar('payload_sent', { length: 4000 }),
  responseReceived: varchar('response_received', { length: 4000 }),
  status: varchar('status', { length: 20 }).notNull(), // SUCCESS | FAILED | REJECTED_POSTED
  syncedAt: timestamp('synced_at').defaultNow(),
});

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  invoiceId: uuid('invoice_id').references(() => invoices.id),
  amount: doublePrecision('amount').notNull(),
  receivedAt: date('received_at').notNull(),
});
```

---

## 3. Business rules

### 3.1 Rates
| Rate | Value | Status |
|---|---|---|
| Standard rental | R11.50 excl. VAT / toilet / day | Confirmed |
| Standard service | R96.50 excl. VAT / toilet / service | Confirmed |
| Disabled unit rental | — | **Open — confirm actual rate; not present in checked July invoices** |
| Relocation | — | **Open — confirm rate and what triggers a billable relocation** |
| VAT | 15% | Confirmed |

### 3.2 Billing period cycle
- **Standard**: 26th of previous month → 25th of current month.
- **June override**: 25 May → 30 June.
- **July readjustment**: 1 July → 25 July.
- Config-driven, not hardcoded. Worth confirming whether this recurs every year (likely, given
  City of Tshwane's 30 June financial year-end) or was specific to 2026.
- **First-month proration**: for a new allocation, period start = delivery date; later months fall
  back to the standard cycle automatically once cycle start postdates delivery date.

### 3.3 Onboarding (per Allocation)
Multi-step, resumable, skippable, independently saved:
1. Allocation meta — region, CoT coordinator, total toilet count, delivery date
2. Area split — divide total toilets across Areas (must sum to total)
3. Toilet numbers + coordinates + type, per Area
4. Site coordinator + employees, per Area
5. Service schedule — 2 weekdays, once per allocation

Status is `PARTIAL` until every step reports complete; `COMPLETE` unlocks invoice generation for
that allocation. Steps can be completed out of order and resumed later.

### 3.4 Personnel & POPIA
- One Site Coordinator per Area, never shared across Areas.
- Cleaners: soft target ~1 per 10 toilets — warn, don't block.
- EPWP staff ID numbers are personal information under POPIA — store in a separate,
  access-restricted table, not on the general employee record.

---

## 4. Sage integration

- **Invoice number**: always Sage-assigned; the app posts without a number and stores whatever
  comes back.
- **Amount & descriptions**: app is source of truth. If Sage-side data drifts, the app's sync
  overwrites it.
- **Confirmed**: Sage's API does allow amount edits on existing invoices (further detail pending).
- **Payload**: ≤4 aggregated lines per invoice (see §1), built from that allocation's `PeriodLine`
  rows for the period.
- Every sync writes to a `SageSyncLog` — previous amount, new amount, payload, response, status —
  as the audit trail for a municipal client.

---

## 5. Document generation & workflow

- Generating an invoice can either auto-generate the full document bundle (invoice, service notes,
  cleaning schedule, EPWP list, GPS coordinates) in one action, or the user can review/print each
  document individually.
- Reference data (toilet numbers, coordinates, coordinator/employee names) lives in the system
  going forward rather than Excel — only re-entered when a toilet is added/removed or a new
  allocation happens.

---

## 6. Open items
1. Confirm disabled-unit rental rate and relocation rate.
2. Confirm whether the June/July cycle shift recurs every year of the contract.
3. Confirm full details of Sage's edit-after-post API behavior.
4. Decide storage approach for EPWP ID numbers (separate restricted table recommended).
