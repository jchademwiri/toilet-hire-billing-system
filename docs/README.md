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

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `SAGE_API_KEY` | Not needed until Phase 5 (Sage sync) — leave unset until then |
| `SAGE_COMPANY_ID` | Same — Phase 5 only |

## Project status

Sage integration is deliberately **not** part of the initial build. Invoice numbers are entered
manually until Phase 5. See the PRD's phasing section for the full rollout order.

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
