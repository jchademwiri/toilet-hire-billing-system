# HS02 Billing & Operations

Custom billing and operations system for Contract HS 02-2025/26 (Hiring and Servicing of Chemical
Toilets, City of Tshwane). Replaces the manual monthly Excel workflow with a database-driven app.

See also, in order:
- `HS02-Billing-System-PRD.md` — why this exists, scope, success criteria
- `HS02-Billing-System-Spec-v3.md` — full technical spec, schema, business rules
- `HS02-Billing-System-Screens.md` — every screen, what it does, phase mapping
- `HS02-Data-Migration-Plan.md` — mapping current Excel files to the schema
- `HS02-Validation-Plan.md` — real invoice figures used as calculation-engine test cases
- `HS02-Data-Handling-POPIA.md` — how EPWP employee personal information is handled

## Reference files

The `excel-sheets/` directory contains the actual Tshwane-approved Excel workbooks used as the
source-of-truth for document layouts and data migration:

| Folder | Contents |
|---|---|
| `01 Region 2/` | July invoice + toilet coordinates for Region 2 |
| `02 Region 5/Site 1/` | July invoice + toilet coordinates for Region 5 Site 1 |
| `02 Region 5/Site 2 - LEEUWFONTEIN/` | July invoice + toilet coordinates + EPWP employee data for Leeuwfontein |
| `03 Project Statements/` | Historical project statement with aging |
| `04 Toilet Services/` | Service notes template and timesheets |

These are the layouts approved by City of Tshwane — the Document Bundle screen renders documents
matching these formats exactly.

## Stack

- Next.js, TypeScript, Tailwind, shadcn/ui
- Drizzle ORM, Postgres
- Document generation: HTML→PDF (headless Chromium) or `@react-pdf/renderer`

## Getting started

```bash
git clone <repo-url>
cd hs02-billing
npm install
cp .env.example .env.local   # fill in DATABASE_URL and any other secrets
npx drizzle-kit push         # create schema
npm run seed                 # run the migration script — see HS02-Data-Migration-Plan.md
npm run dev
```

## Rebranding for another client

The app supports per-deployment rebranding via a single config file:

```bash
cp src/config/company.example.ts src/config/company.ts
```

Edit `src/config/company.ts` to change the brand name, logo text, client name, contract reference,
description, SEO metadata, and coordinator labels. The file is git-ignored so custom values stay
local.

## Theme

Light/dark mode toggle is available in the header. The preference is persisted to localStorage and
defaults to the OS system preference on first visit.

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `SAGE_API_KEY` | Not needed until Phase 5 (Sage sync) — leave unset until then |
| `SAGE_COMPANY_ID` | Same — Phase 5 only |

## Project status

Sage integration is deliberately **not** part of the initial build. Invoice numbers follow the
`STP-INV-26-XXXX` convention entered manually until Phase 5. See the PRD's phasing section for the
full rollout order.

### Screens built (16 total)

| Status | Screens |
|---|---|
| ✅ Built | Dashboard, Allocations, New Allocation Wizard, Allocation Detail, Billing Hub, Invoices, Payments, Statement & Aging, Regions, Coordinators, Employees, Settings, Sage Sync Log, Audit Log, Help, Reports |
| ❌ Not built | Document Bundle / Previewer |

## Running calculation-engine tests

The engine's correctness is checked against real invoice figures, not synthetic data — see
`HS02-Validation-Plan.md` for the exact expected numbers per test case.

```bash
npm run test:engine
```

All three current test cases (Region 2, Region 5 Site 1, Region 5 Leeuwfontein) must match their
real invoice totals to the cent before this is considered passing — Leeuwfontein in particular
covers the mid-period toilet-removal proration case and shouldn't be skipped.

## Contributing / conventions

- Never hard-delete a `toilet`, `area`, or `serviceSchedule` row — use `effectiveTo`/`removedOn` so
  past billing periods still compute correctly.
- Invoices are scoped per **allocation**, not per region — see Spec v3 §2 if this seems surprising
  when adding a new region feature.
- EPWP ID numbers never go in the general `employees` table — see the POPIA note before touching
  that module.
- GPS coordinates use **DMS format** (e.g. `25°23'24.7"S 28°14'53.1"E`) matching the approved
  Excel coordinate sheets.
