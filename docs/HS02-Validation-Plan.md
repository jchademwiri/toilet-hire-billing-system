# HS02 — Calculation Engine Validation Plan

Companion to Spec v3. The PRD's success metric is "zero manual arithmetic" — this only means
something if the engine is checked against real numbers before it's trusted with a live
submission. This document is that check: the actual July 2026 figures as expected output, plus the
specific edge cases already visible in your own data.

---

## Method

For each allocation below, feed the engine the real period dates, area/toilet counts, and schedule,
and assert the computed rental amount, service amount, subtotal, VAT, and gross match the actual
invoice figures **exactly**, not approximately. Any mismatch means either a bug in the engine or —
just as usefully — a business rule that isn't understood yet.

Period for all three test cases below: **1 July 2026 – 25 July 2026** (25 days).

---

## Test case 1 — Region 2 (13 areas, single schedule, no proration)

Rate: R11.50 rental, R96.50 service. Schedule: Monday & Thursday (7 occurrences in the period for
every area — confirms the engine's weekday-counting logic against a real 25-day window).

| Area | Qty | Days | Rental | Services | Service amt | Subtotal |
|---|---|---|---|---|---|---|
| Themba View Ext 1 | 8 | 25 | 2,300.00 | 7 | 5,404.00 | 7,704.00 |
| Marokolong | 11 | 25 | 3,162.50 | 7 | 7,430.50 | 10,593.00 |
| Hammanskraal Ext 4 | 30 | 25 | 8,625.00 | 7 | 20,265.00 | 28,890.00 |
| Hammanskraal portion 9 & 10 | 160 | 25 | 46,000.00 | 7 | 108,080.00 | 154,080.00 |
| Soshanguve X Buffer C | 50 | 25 | 14,375.00 | 7 | 33,775.00 | 48,150.00 |
| Soshanguve X Buffer D | 60 | 25 | 17,250.00 | 7 | 40,530.00 | 57,780.00 |
| Soshanguve X Buffer Civcon | 10 | 25 | 2,875.00 | 7 | 6,755.00 | 9,630.00 |
| Dali Mpofu | 40 | 25 | 11,500.00 | 7 | 27,020.00 | 38,520.00 |
| Stinkwater | 3 | 25 | 862.50 | 7 | 2,026.50 | 2,889.00 |
| Stinkwater Ext 10 | 70 | 25 | 20,125.00 | 7 | 47,285.00 | 67,410.00 |
| Chris Hani | 80 | 25 | 23,000.00 | 7 | 54,040.00 | 77,040.00 |
| Phomolong Phase 1 | 59 | 25 | 16,962.50 | 7 | 39,854.50 | 56,817.00 |
| Greenfield Ext 14 | 15 | 25 | 4,312.50 | 7 | 10,132.50 | 14,445.00 |

**Expected totals**: 596 toilets · Rental **R171,350.00** · Service **R402,598.00** ·
Subtotal **R573,948.00** · VAT @ 15% **R86,092.20** · Gross **R660,040.20**.

---

## Test case 2 — Region 5, Site 1 (3 areas, Tuesday & Friday schedule)

| Area | Qty | Days | Rental | Services | Service amt | Subtotal |
|---|---|---|---|---|---|---|
| Wallmansthall Berlin | 22 | 25 | 6,325.00 | 7 | 14,861.00 | 21,186.00 |
| Rayton Plot 121 | 1 | 25 | 287.50 | 7 | 675.50 | 963.00 |
| Pienaarspoort Ext 22 | 12 | 25 | 3,450.00 | 7 | 8,106.00 | 11,556.00 |

**Expected totals**: 35 toilets · Rental **R10,062.50** · Service **R23,642.50** ·
Subtotal **R33,705.00** · VAT **R5,055.75** · Gross **R38,760.75**.

---

## Test case 3 — Region 5, Leeuwfontein — **the critical proration edge case**

This invoice has **two lines for the same area** ("Leeuwfontein Ext 32"), split by a mid-period
change:

| Area | Qty | Days | Rental | Services | Service amt | Subtotal |
|---|---|---|---|---|---|---|
| Leeuwfontein Ext 32 (batch A) | 10 | 25 | 2,875.00 | 7 | 6,755.00 | 9,630.00 |
| Leeuwfontein Ext 32 (batch B) | 10 | 21 | 2,415.00 | 6 | 5,790.00 | 8,205.00 |

**Expected totals**: 20 toilets · Rental **R5,290.00** · Service **R12,545.00** ·
Subtotal **R17,835.00** · VAT **R2,675.25** · Gross **R20,510.25**.

**Why this matters**: 10 of the 20 toilets in this area were only active for 21 of the 25 days (and
saw only 6 of the 7 possible services), while the other 10 ran the full period. This is exactly the
"toilet added or removed mid-month" scenario the whole proration engine exists to handle
automatically — **this is the single most important test case to get passing**, because it's real
evidence the per-toilet (not just per-area) proration logic is required, not just per-area date
ranges. If the engine only tracks install/removal dates at the Area level rather than the Toilet
level, this case cannot be reproduced.

---

## Additional checks beyond the three invoices

1. **June year-end period** (25 May – 30 June): once June 2026 data is available, validate the
   engine against it the same way — this also confirms the period-override config, not just the
   calculation.
2. **First-month proration**: construct a synthetic allocation with a delivery date mid-period and
   confirm days/services compute from delivery date forward, not from the period start.
3. **Weekday-counting correctness**: spot-check that Monday & Thursday in a 25-day July window
   really does produce 7 occurrences (it does, per the real data above) and that a 21-day window
   correctly produces 6 — both already evidenced in test case 3.
4. **Aggregation into the Sage payload**: confirm that summing all `periodLines` for an allocation
   by rate-type reproduces the client-invoice subtotal exactly (571,350 + 402,598 for Region 2,
   etc.) before wiring up any Sage integration.

## Pass criteria
All three test cases must match their real invoice totals to the cent before the calculation
engine is considered validated. This is the gate for closing out Phase 3 in the PRD's phasing.
