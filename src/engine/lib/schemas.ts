// ─────────────────────────────────────────────────────────────────────────────
// Domain schemas — Zod-powered type definitions shared by mock data, the
// billing engine, Drizzle ORM tables, and every page in the app.
//
// WHY:     One source of truth for every domain shape. Mock data validates
//          through these, the engine consumes the inferred types, and the
//          Drizzle schema mirrors the same columns. When you swap mock data
//          for real DB queries, the engine and pages don't need to change.
//
// MIGRATION:  Keep these schemas in sync with db/schema.ts (the Drizzle
//             tables). The Zod types ARE the contract — Drizzle columns
//             should match them exactly.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod';

// ── Re-usable primitives ─────────────────────────────────────────────────────

const nonNegativeNumber = z.number().nonnegative();
const positiveNumber = z.number().positive();
const isoDateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected ISO date (YYYY-MM-DD)');
const isoDateTimeString = z.string().datetime();
const nullishString = z.string().nullable();

// ── Enums ────────────────────────────────────────────────────────────────────

export const OnboardingStatusEnum = z.enum(['COMPLETE', 'IN_PROGRESS']);
export type OnboardingStatus = z.infer<typeof OnboardingStatusEnum>;

export const PositionEnum = z.enum(['Coordinator', 'Cleaner']);
export type Position = z.infer<typeof PositionEnum>;

export const PaymentStatusEnum = z.enum(['PAID', 'OUTSTANDING', 'DRAFT']);
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;

export const SyncStatusEnum = z.enum(['SUCCESS', 'FAILED']);
export type SyncStatus = z.infer<typeof SyncStatusEnum>;

export const DayOfWeekEnum = z.enum([
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
]);
export type DayOfWeek = z.infer<typeof DayOfWeekEnum>;

// ── Contract ─────────────────────────────────────────────────────────────────

export const ContractSchema = z.object({
  id: z.string(),
  reference: z.string(),
  client: z.string(),
  rentalRate: positiveNumber,
  disabledRentalRate: z.number().nullable(),
  serviceRate: positiveNumber,
  relocationRate: z.number().nullable(),
  vatRate: z.number().min(0).max(100),
  startDate: isoDateString,
  endDate: isoDateString,

  // Banking details
  bankName: z.string(),
  accountNumber: z.string(),
  branchCode: z.string(),

  // Service provider letterhead
  vatNumber: z.string(),
  vendorNumber: z.string(),
  regNo: z.string(),
  addressLines: z.array(z.string()),
  tel: z.string(),
  cell: z.string(),
  fax: z.string(),
  email: z.string().email(),
  emailAlt: z.string().email(),
  website: z.string(),

  // Client letterhead
  clientVatNumber: z.string(),
  clientAddressLines: z.array(z.string()),
  clientTel: z.string(),
});
export type Contract = z.infer<typeof ContractSchema>;

// ── Region ───────────────────────────────────────────────────────────────────

export const RegionSchema = z.object({
  id: z.string(),
  contractId: z.string(),
  name: z.string(),
});
export type Region = z.infer<typeof RegionSchema>;

// ── CoT Coordinator ──────────────────────────────────────────────────────────

export const CotCoordinatorSchema = z.object({
  id: z.string(),
  regionId: z.string(),
  fullname: z.string().min(1),
  cellphone: nullishString,
  email: nullishString,
});
export type CotCoordinator = z.infer<typeof CotCoordinatorSchema>;

// ── Allocation ───────────────────────────────────────────────────────────────

export const AllocationSchema = z.object({
  id: z.string(),
  regionId: z.string(),
  regionName: z.string(),
  cotCoordinatorId: z.string(),
  cotCoordinatorName: z.string(),
  totalToilets: z.number().int().nonnegative(),
  deliveryDate: isoDateString,
  onboardingStatus: OnboardingStatusEnum,
});
export type Allocation = z.infer<typeof AllocationSchema>;

// ── Area (site within an allocation) ─────────────────────────────────────────

export const AreaSchema = z.object({
  id: z.string(),
  allocationId: z.string(),
  name: z.string().min(1),
  toiletCount: z.number().int().nonnegative(),
  siteCoordinatorId: z.string(),
  lat: z.number(),
  lng: z.number(),
  rowNumber: z.number().int().nonnegative(),
});
export type Area = z.infer<typeof AreaSchema>;

// ── Employee ─────────────────────────────────────────────────────────────────

export const EmployeeSchema = z.object({
  id: z.string(),
  areaId: z.string(),
  fullname: z.string().min(1),
  position: PositionEnum,
});
export type Employee = z.infer<typeof EmployeeSchema>;

// ── Service Schedule ─────────────────────────────────────────────────────────

export const ServiceScheduleSchema = z.object({
  id: z.string(),
  allocationId: z.string(),
  day1: DayOfWeekEnum,
  day2: DayOfWeekEnum,
  effectiveFrom: isoDateString,
  effectiveTo: isoDateString.nullable(),
});
export type ServiceSchedule = z.infer<typeof ServiceScheduleSchema>;

// ── Billing Period ───────────────────────────────────────────────────────────

export const BillingPeriodSchema = z.object({
  id: z.string(),
  label: z.string(),
  periodStart: isoDateString,
  periodEnd: isoDateString,
  isManualOverride: z.boolean(),
});
export type BillingPeriod = z.infer<typeof BillingPeriodSchema>;

// ── Invoice ──────────────────────────────────────────────────────────────────

export const InvoiceSchema = z.object({
  id: z.string(),
  allocationId: z.string(),
  allocationName: z.string(),
  billingPeriodId: z.string(),
  billingPeriodLabel: z.string(),
  invoiceNumber: nullishString,
  invoiceDate: isoDateString,
  subtotal: nonNegativeNumber,
  vat: nonNegativeNumber,
  gross: nonNegativeNumber,
  paymentStatus: PaymentStatusEnum,
  sageSyncedAt: isoDateTimeString.nullable(),
});
export type Invoice = z.infer<typeof InvoiceSchema>;

// ── Payment ──────────────────────────────────────────────────────────────────

export const PaymentSchema = z.object({
  id: z.string(),
  invoiceId: z.string(),
  amount: positiveNumber,
  receivedAt: isoDateString,
});
export type Payment = z.infer<typeof PaymentSchema>;

// ── Sage Sync Log ────────────────────────────────────────────────────────────

export const SageSyncLogSchema = z.object({
  id: z.string(),
  invoiceId: z.string(),
  invoiceNumber: nullishString,
  previousGross: z.number().nullable(),
  newGross: z.number().nullable(),
  status: SyncStatusEnum,
  syncedAt: isoDateTimeString,
});
export type SageSyncLog = z.infer<typeof SageSyncLogSchema>;

// ── Engine-specific (computed) types ─────────────────────────────────────────

/** A single line item produced by computeAreaLines — the atomic unit
 *  of every billing calculation in the app. */
export const AreaLineSchema = z.object({
  idx: z.number().int().nonnegative(),
  name: z.string(),
  qty: z.number().int().nonnegative(),
  days: z.number().int().nonnegative(),
  rentalAmount: nonNegativeNumber,
  services: z.number().int().nonnegative(),
  serviceAmount: nonNegativeNumber,
  subtotal: nonNegativeNumber,
});
export type AreaLine = z.infer<typeof AreaLineSchema>;

// ── Aging ────────────────────────────────────────────────────────────────────

export const AgingBucketEnum = z.enum(['current', '30', '60', '90plus']);
export type AgingBucket = z.infer<typeof AgingBucketEnum>;

// ── Billing preview (computed) ───────────────────────────────────────────────

export const BillingPreviewSchema = z.object({
  daysInPeriod: z.number().int().positive(),
  serviceDays: z.number().int().nonnegative(),
  totalToilets: z.number().int().nonnegative(),
  rentalAmount: nonNegativeNumber,
  serviceAmount: nonNegativeNumber,
  subtotal: nonNegativeNumber,
  vat: nonNegativeNumber,
  gross: nonNegativeNumber,
});
export type BillingPreview = z.infer<typeof BillingPreviewSchema>;
