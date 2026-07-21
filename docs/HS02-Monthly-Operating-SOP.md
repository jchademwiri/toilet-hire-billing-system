# HS02 — Monthly Operating SOP

Plain-language runbook for running a billing cycle once the app exists. This also doubles as the
acceptance criteria for what Phase 5 (Sage sync) needs to automate later — if a manual step here
disappears in Phase 5, that's the automation working correctly.

---

## Standard monthly cycle (per allocation)

1. **Confirm the period.** Open Billing hub for the allocation. The period defaults correctly for
   a normal month (26th–25th); double-check it if this is a June (25 May–30 June) or July
   (1–25 July) cycle, since those use the override rule.
2. **Check for changes since last period.** If a toilet was added, removed, or relocated, or an
   employee/coordinator changed, go to Allocation detail first and log it there — with the correct
   effective date — before generating this period's billing. Don't backdate changes into the
   Billing hub directly.
3. **Review the computed totals.** Billing hub shows days-in-period, service occurrences, rental,
   service, VAT, and gross for the period. Spot-check anything that looks off before generating
   documents — this is a review step, not a rubber stamp.
4. **Generate the document bundle.** Either "Generate all documents" in one step, or open the
   Document bundle screen and generate/print each of Tax Invoice, Service Notes, Cleaning
   Schedule, EPWP Employee List, and GPS Coordinates individually.

## Interim Sage workflow (until Phase 5 exists)

5. **Manually enter the same totals into Sage.** Use the amounts from step 3 as-is — don't
   recalculate in Sage, just transcribe.
6. **Get the sequential invoice number Sage assigns.**
7. **Copy that invoice number into the app's Invoice record.** Until this is filled in, the invoice
   is considered incomplete in the Invoice list screen.
8. **Submit the printed/PDF bundle** to City of Tshwane with that invoice number on it.

*(Once Phase 5 ships, steps 5–7 collapse into a single "Sync to Sage" click — step 8 stays manual
either way, since document submission to the municipality isn't an API integration.)*

## When a payment comes in

9. Open the invoice in Invoice list or Statement & aging, and use Record payment to log the amount
   and date. This is what drives the aging buckets — don't skip logging a payment even if it's a
   partial amount.

## New allocation (mid-contract, not the usual monthly cycle)

10. Create the allocation via the wizard (5 steps — see Screens doc). Nothing about this
    allocation can be billed until all 5 steps report complete.
11. Remember: this gets its **own invoice going forward**, even if it's in a region that already
    has an active allocation — don't try to fold it into an existing invoice.

## Monthly checklist (condensed)

- [ ] Period correct (including June/July override if applicable)
- [ ] Any toilet/employee/coordinator changes logged in Allocation detail first
- [ ] Computed totals reviewed, not just accepted
- [ ] Document bundle generated
- [ ] Sage entry made manually, invoice number copied back (until Phase 5)
- [ ] Bundle submitted to City of Tshwane
- [ ] Payments logged as they arrive
