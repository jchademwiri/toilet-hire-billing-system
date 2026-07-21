# HS02 — Data Migration Plan

Companion to Spec v3. This maps every current Excel workbook to the exact tables it seeds, so the
one-time migration from Excel to the system is a checklist, not a guess.

---

## Source files → destination tables

### `HS_02_Project_Statement_Region.xlsx`
Sheets: `Invoice - Region 2`, `Invoice - Region 5`, `Invoice - Region 5-Leeuwfontein`, `Config`.
- **Feeds**: `invoices` (historical rows — invoice number, date, amount, per allocation), `payments`
  (if payment history is present), `contracts`/`billingPeriods` config (the `Config` sheet).
- **Action**: import as historical read-only records — these become the seed for the aging/
  statement view on day one, not live-edited going forward.

### `July - HS 02 Region 2 Invoice.xlsx`
Sheets: `Invoice - Region 2`, `Service Notes`, `Clearning Schedule`, `EPWP Employees`.
- **Feeds**:
  - `Invoice - Region 2` → `allocations` (Region 2, total 596), `areas` (13 rows — Themba View Ext
    1, Marokolong, Hammanskraal Ext 4, Hammanskraal portion 9 & 10, Soshanguve X Buffer C/D/Civcon,
    Dali Mpofu, Stinkwater, Stinkwater Ext 10, Chris Hani, Phomolong Phase 1, Greenfield Ext 14),
    `periodLines` (one row per area, for July as the historical baseline).
  - `Service Notes` → confirms the service schedule (Monday & Thursday for all Region 2 areas) →
    `serviceSchedules` at the allocation level.
  - `EPWP Employees` → `employees` (fullname, position, area) — **ID numbers go to the separate
    restricted table, not the general `employees` row** (see POPIA note).

### `July - HS 02 Toilet Coordinates Region 2.xlsx`
13 sheets, one per area (Themba View Ext 1, Morokolong, Hammanskraal Ext 4, etc.).
- **Feeds**: `toilets` — toilet number + coordinates, one row per toilet, linked to the matching
  `areas` row created above. This is the largest single migration task by row count.

### `July - HS 02 Invoice Region 5 Site 1.xlsx` / `July - HS 02 Toilet Coordinates Region 5.xlsx`
- **Feeds**: `allocations` (Region 5, Site 1 — Wallmansthall/Berlin, Rayton, Pienaarspoort), its
  `areas`, `toilets`, `serviceSchedules` (Tuesday & Friday), `employees` — same pattern as Region 2.
- **Note**: this is a separate `allocation` from Leeuwfontein below, per the invoice-per-allocation
  rule — do not merge them under one Region 5 allocation.

### `July - HS 02 Invoice Region 5 - Leeuwfontein.xlsx` / `...Toilet Coordinates Region 5 - Leeuwfontein.xlsx`
- **Feeds**: a second, distinct `allocations` row under Region 5 (different CoT coordinator/site
  coordinator), its own `areas` (Leeuwfontein Ext 32), `toilets`, `serviceSchedules`, `employees`.

### `July - HS 02 Region 2 Invoice.xlsx` (Employee List variant used in Region 5 files)
Same shape as EPWP Employees above — `employees` per area.

---

## Migration sequence (do this once, in order)

1. **Contract & rates** — create the one `contracts` row (HS 02-2025/26, rates from §3.1 of the
   spec; leave disabled rental/relocation rate null until confirmed).
2. **Regions** — Region 2, Region 5 (two rows only — Site 1 and Leeuwfontein are allocations
   *within* Region 5, not separate regions).
3. **CoT coordinators** — Thoko Maluka (Region 2), Johannes Mtshweni and whoever coordinates
   Leeuwfontein (Region 5) — confirm the actual names/contacts before entering, the ones used in
   mockups were placeholders.
4. **Allocations** — one row each for Region 2, Region 5 Site 1, Region 5 Leeuwfontein. Delivery
   date: use each allocation's actual first-invoice date if known, otherwise the contract start
   (March 2026) as a placeholder to correct later.
5. **Areas** — from the invoice line items in each region's July workbook.
6. **Toilets** — from the coordinates workbooks, linked to the areas created in step 5. Expect this
   to be the slowest step — hundreds of rows per region.
7. **Service schedules** — one row per allocation, derived from the Service Notes sheet's weekday
   columns.
8. **Employees** — from the EPWP/Employee List sheets, split fullname/position into `employees`
   and ID numbers into the restricted table.
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

## Open item
Confirm actual delivery dates for each allocation (not just "start of contract") — this matters
because it's what anchors month-1 proration if any allocation's true delivery date differs from
March 2026.
