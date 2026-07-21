# HS02 — Data Handling Note (POPIA)

Companion to Spec v3 and the Screens document. This has come up three times across the design
(schema, screens, PRD) — collecting it in one place rather than leaving it as scattered callouts.

## What triggered this

The EPWP Employee List sheets (used in every region's July workbook) include each employee's full
13-digit South African ID number alongside their name and role. That's personal information under
the Protection of Personal Information Act (POPIA), not just an operational data point.

## What this system will store, and where

| Field | Sensitivity | Where it lives |
|---|---|---|
| Employee full name, position, area assignment | Low — operational | `employees` table, normal access |
| Employee ID number | High — POPIA-protected | Separate, access-restricted table, not on `employees` |
| CoT coordinator name/contact | Low — business contact | `cotCoordinators`, normal access |
| Toilet numbers, GPS coordinates | Low — asset data | `toilets`, normal access |
| Invoice amounts, banking details | Business-sensitive, not personal | `invoices`, `contracts` |

## Why the ID number is split out

- **Minimization**: most screens and documents that reference an employee (service notes,
  cleaning schedules, the onboarding wizard) never need the ID number — only whatever process
  actually requires identity verification does. Keeping it in a separate table means the common
  path never touches it.
- **Access control**: the restricted table can have its own, narrower access policy (e.g. only the
  account owner can query it) independent of general app access to `employees`.
- **Encryption at rest**: this is the field worth encrypting specifically, rather than applying
  blanket encryption to the whole database.

## What this means practically for the build

- The onboarding wizard's "assign employees" step captures name and position as normal fields; ID
  number (if collected at all) goes through a separate, clearly-labeled field that writes to the
  restricted table.
- The Employees screen (per the Screens doc) shows name/position/area by default; ID number is a
  separate, explicitly-opened view — not a column in the default table.
- No document the system generates (invoice, service notes, cleaning schedule) needs to print an
  ID number — none of the source workbooks show it being used that way, so there's no reason to
  surface it in generated PDFs.

## Open question worth resolving before building the employee module
Does STP actually need to store ID numbers in this system at all, or is that only needed for
payroll/EPWP compliance systems that already exist elsewhere? If the latter, the simplest and
safest answer is: **don't store it here** — reference an external system by employee number
instead of duplicating the ID number into a new database. Worth confirming before building the
restricted table, since not building it at all is the lowest-risk option if it isn't actually
needed.
