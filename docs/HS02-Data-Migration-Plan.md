# HS02 — Data Migration Plan

Companion to Spec v3. This maps every current Excel workbook to the exact tables it seeds, so the
one-time migration from Excel to the system is a checklist, not a guess.

**Reference files**: all source Excel files are stored in `docs/excel-sheets/`. These are the
Tshwane-approved layouts and should be treated as the source of truth for format verification.

---

## Source files → destination tables

### `HS 02 Project Statement Region.xlsx`
**Location**: `docs/excel-sheets/03 Project Statements/`
**Sheet**: `Invoice - Region 2`
- **Feeds**: `invoices` (historical rows — invoice number `STP-INV-26-XXXX`, date, amount, per
  allocation), `payments` (if payment history is present), `contracts`/`billingPeriods` config.
- **Action**: import as historical read-only records — these become the seed for the aging/
  statement view on day one, not live-edited going forward.

### `July - HS 02 Region 2 Invoice.xlsx`
**Location**: `docs/excel-sheets/01 Region 2/`
**Sheets**: `Invoice - Region 2`
- **Feeds**:
  - `Invoice - Region 2` → `allocations` (Region 2, total 596), `areas` (13 rows — Themba View Ext
    1, Marokolong, Hammanskraal Ext 4, Hammanskraal portion 9 & 10, Soshanguve X Buffer C/D/Civcon,
    Dali Mpofu, Stinkwater, Stinkwater Ext 10, Chris Hani, Phomolong Phase 1, Greenfield Ext 14),
    `periodLines` (one row per area, for July as the historical baseline).
  - Service schedule (Monday & Thursday for all Region 2 areas) → `serviceSchedules` at the
    allocation level.
- **Note**: this workbook has no embedded Service Notes sheet — see separate file below.

### `July - HS 02 Toilet Coordinates Region 2.xlsx`
**Location**: `docs/excel-sheets/01 Region 2/`
**Sheets**: one per area (Themba View Ext 1, Marokolong, Hammanskraal Ext 4, etc.)
- **Feeds**: `toilets` — toilet number + DMS coordinates, one row per toilet, linked to the
  matching `areas` row created above. Columns: `Number | Toilet Number | Co-ordinates`.
- **Action**: This is the largest single migration task by row count (~600 rows for Region 2).

### `July - HS 02 Invoice Region 5 Site 1.xlsx` / `July - HS 02 Toilet Coordinates Region 5.xlsx`
**Location**: `docs/excel-sheets/02 Region 5/Site 1/`
- **Feeds**: `allocations` (Region 5, Site 1 — Wallmansthall/Berlin, Rayton, Pienaarspoort), its
  `areas`, `toilets`, `serviceSchedules` (Tuesday & Friday), `employees` — same pattern as Region 2.
- **Note**: this is a separate `allocation` from Leeuwfontein below, per the invoice-per-allocation
  rule — do not merge them under one Region 5 allocation.

### `July - HS 02 Invoice Region 5 - Leeuwfontein.xlsx` / `...Toilet Coordinates Region 5 - Leeuwfontein.xlsx`
**Location**: `docs/excel-sheets/02 Region 5/Site 2 - LEEUWFONTEIN/`
- **Feeds**: a second, distinct `allocations` row under Region 5 (different CoT coordinator/site
  coordinator), its own `areas` (Leeuwfontein Ext 32), `toilets`, `serviceSchedules`, `employees`.
- **Note**: this allocation has a **prorated line** — 10 toilets × 25 days + 10 toilets × 21 days
  for the same area — due to a mid-period removal. See Validation Plan for exact expected figures.

### `Service notes.xlsx`
**Location**: `docs/excel-sheets/04 Toilet Services/`
- **Feeds**: confirms the Service Notes layout requirements — one row per area, one column per
  actual service date in the period, plus a "No of Service" count. Also the source for the Weekly
  Cleaning Schedule and EPWP Employee List document formats (built at
  `src/app/cleaning-schedule/[id]/page.tsx` and `src/app/epwp/[id]/page.tsx`).
- **Action**: used as the template for the Document Bundle's Service Notes, Cleaning Schedule, and
  EPWP Employee List documents. No data rows to migrate — this is a format reference.

### `Timesheets.xlsx`
**Location**: `docs/excel-sheets/04 Toilet Services/`
- **Action**: review if this contains employee hours that need to feed the document bundle, or if
  it's purely operational tracking external to this system.

---

## Migration sequence (do this once, in order)

1. **Contract & rates** — create the one `contracts` row (HS 02-2025/26, rates from §3.1 of the
   spec; leave disabled rental/relocation rate null until confirmed).
2. **Regions** — Region 2, Region 5 (two rows only — Site 1 and Leeuwfontein are allocations
   *within* Region 5, not separate regions).
3. **CoT coordinators** — confirm actual names from the Excel files (Region 2: Thoko Maluka;
   Region 5: Johannes Mtshweni and Leeuwfontein contact — verify from source workbooks). The
   names currently in mock-data are placeholders.
4. **Allocations** — one row each for Region 2, Region 5 Site 1, Region 5 Leeuwfontein. Delivery
   date: use each allocation's actual first-invoice date if known, otherwise the contract start
   (March 2026) as a placeholder to correct later.
5. **Areas** — from the invoice line items in each region's July workbook.
6. **Toilets** — from the coordinates workbooks, linked to the areas created in step 5. Expect this
   to be the slowest step — hundreds of rows per region.
7. **Service schedules** — one row per allocation, derived from the invoice workbook:
   - Region 2: Monday & Thursday
   - Region 5 Site 1: Tuesday & Friday
   - Region 5 Leeuwfontein: (confirm from source)
8. **Employees** — from the EPWP/Employee List sheets in each region's file and the
   `Leeufontein New Staff.zip` archive. Split fullname/position into `employees` and ID numbers
   into the restricted table.
9. **Historical invoices & payments** — from the Project Statement workbook, as read-only seed
   data for the statement/aging view.
10. **Validate** — run the calculation engine against July as the test period and confirm the
    output matches the real July invoices line-for-line (see the Validation Plan).

## What does NOT get migrated
- Formulas/formatting from the Excel files — only values.
- The "2 clean lines" Sage-style aggregation from the earlier draft simulator — that's computed
  fresh by the engine, never stored as source data.
- Anything from the original AI-drafted spec that wasn't confirmed against real files (disabled
  rate, relocation rate, ward number, safe disposal certificate) — these are not migrated because
  they don't exist yet in your source data.

## Open items
1. Confirm actual delivery dates for each allocation (not just "start of contract") — this matters
   because it's what anchors month-1 proration.
2. Extract `Leeufontein New Staff.zip` to confirm employee roster for the Leeuwfontein allocation.
3. Determine whether `Timesheets.xlsx` needs to be integrated or is external to the system.
