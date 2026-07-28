// ── The engine ────────────────────────────────────────────────────────────────
// Single home for every billing/financial calculation in the app: per-area
// invoice lines, invoice totals, the billing hub preview, payment rollups,
// and AR aging. Add new calculations here, not inline in a page or document.
//
// Domain types live in ./lib/schemas.ts so they can be shared by mock data,
// engine functions, pages, and the Drizzle ORM schema without circular imports.

export * from './invoice-lines';
export * from './invoice-totals';
export * from './billing';
export * from './payments';
export * from './aging';
export * from './invoices';

// Re-export canonical domain types so pages can import everything from '@/engine'
export type {
  Contract,
  Region,
  Allocation,
  Area,
  Employee,
  Invoice,
  Payment,
  SageSyncLog,
  BillingPeriod,
  ServiceSchedule,
  CotCoordinator,
  AreaLine,
  BillingPreview,
  AgingBucket,
  PaymentStatus,
  OnboardingStatus,
  Position,
  SyncStatus,
} from './lib/schemas';

// ── PDF engine (print styles, coordinate formatting, service dates) ─────────
export {
  printStyles,
  bundlePrintStyles,
  toDMS,
  generateToiletNumbers,
  computeServiceDates,
} from './pdf';
export type { ServiceDate } from './pdf';
