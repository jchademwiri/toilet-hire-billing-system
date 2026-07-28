// ─────────────────────────────────────────────────────────────────────────────
// Drizzle ORM schema — mirrors the canonical domain types from
// src/engine/lib/schemas.ts one-to-one.
//
// WHY separate files?  Zod shapes (engine/lib/schemas.ts) define the in-memory
// contract consumed by engine functions, pages, and documents. Drizzle tables
// (this file) define how those same shapes are persisted. Keeping them apart
// avoids coupling the engine to a specific ORM and makes the migration from
// mock data to real DB a drop-in replacement.
//
// MIGRATION:  Every column here should match its counterpart in
//             engine/lib/schemas.ts.  Run  `bun drizzle-kit push`  to sync
//             these tables to Neon, then switch each data import one by one.
// ─────────────────────────────────────────────────────────────────────────────

import { sql } from 'drizzle-orm';
import {
  pgTable, text, numeric, integer, boolean, date, timestamp,
} from 'drizzle-orm/pg-core';

// ── Contract (singleton — one contract per billing system) ──────────────────

export const contracts = pgTable('contracts', {
  id: text('id').primaryKey(),
  reference: text('reference').notNull(),
  client: text('client').notNull(),
  rentalRate: numeric('rental_rate', { precision: 12, scale: 2 }).notNull(),
  disabledRentalRate: numeric('disabled_rental_rate', { precision: 12, scale: 2 }),
  serviceRate: numeric('service_rate', { precision: 12, scale: 2 }).notNull(),
  relocationRate: numeric('relocation_rate', { precision: 12, scale: 2 }),
  vatRate: numeric('vat_rate', { precision: 5, scale: 2 }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),

  // Banking
  bankName: text('bank_name').notNull(),
  accountNumber: text('account_number').notNull(),
  branchCode: text('branch_code').notNull(),

  // Provider letterhead
  vatNumber: text('vat_number').notNull(),
  vendorNumber: text('vendor_number').notNull(),
  regNo: text('reg_no').notNull(),
  addressLines: text('address_lines').array().notNull(),
  tel: text('tel').notNull(),
  cell: text('cell').notNull(),
  fax: text('fax').notNull(),
  email: text('email').notNull(),
  emailAlt: text('email_alt').notNull(),
  website: text('website').notNull(),

  // Client letterhead
  clientVatNumber: text('client_vat_number').notNull(),
  clientAddressLines: text('client_address_lines').array().notNull(),
  clientTel: text('client_tel').notNull(),

  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ── Regions ──────────────────────────────────────────────────────────────────

export const regions = pgTable('regions', {
  id: text('id').primaryKey(),
  contractId: text('contract_id')
    .notNull()
    .references(() => contracts.id),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ── CoT Coordinators ─────────────────────────────────────────────────────────

export const cotCoordinators = pgTable('cot_coordinators', {
  id: text('id').primaryKey(),
  regionId: text('region_id')
    .notNull()
    .references(() => regions.id),
  fullname: text('fullname').notNull(),
  cellphone: text('cellphone'),
  email: text('email'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ── Allocations (per-region toilet allotments) ──────────────────────────────

export const allocations = pgTable('allocations', {
  id: text('id').primaryKey(),
  regionId: text('region_id')
    .notNull()
    .references(() => regions.id),
  regionName: text('region_name').notNull(),
  cotCoordinatorId: text('cot_coordinator_id')
    .notNull()
    .references(() => cotCoordinators.id),
  cotCoordinatorName: text('cot_coordinator_name').notNull(),
  totalToilets: integer('total_toilets').notNull(),
  deliveryDate: date('delivery_date').notNull(),
  onboardingStatus: text('onboarding_status', { enum: ['COMPLETE', 'IN_PROGRESS'] }).notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ── Areas (individual sites within an allocation) ──────────────────────────

export const areas = pgTable('areas', {
  id: text('id').primaryKey(),
  allocationId: text('allocation_id')
    .notNull()
    .references(() => allocations.id),
  name: text('name').notNull(),
  toiletCount: integer('toilet_count').notNull(),
  // App-level FK to employees — no database constraint because employees
  // references areas.id and PostgreSQL cannot enforce circular FKs.
  siteCoordinatorId: text('site_coordinator_id').notNull(),
  lat: numeric('lat', { precision: 10, scale: 6 }).notNull(),
  lng: numeric('lng', { precision: 10, scale: 6 }).notNull(),
  rowNumber: integer('row_number').notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ── Employees ──────────────────────────────────────────────────────────────

export const employees = pgTable('employees', {
  id: text('id').primaryKey(),
  areaId: text('area_id')
    .notNull()
    .references(() => areas.id),
  fullname: text('fullname').notNull(),
  position: text('position', { enum: ['Coordinator', 'Cleaner'] }).notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ── Employee ID numbers (POPIA-restricted, separate table) ────────────────

export const employeeIdNumbers = pgTable('employee_id_numbers', {
  employeeId: text('employee_id')
    .primaryKey()
    .references(() => employees.id),
  idNumber: text('id_number').notNull(),
});

// ── Service Schedules ──────────────────────────────────────────────────────

export const serviceSchedules = pgTable('service_schedules', {
  id: text('id').primaryKey(),
  allocationId: text('allocation_id')
    .notNull()
    .references(() => allocations.id),
  day1: text('day1', {
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  }).notNull(),
  day2: text('day2', {
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  }).notNull(),
  effectiveFrom: date('effective_from').notNull(),
  effectiveTo: date('effective_to'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ── Billing Periods ──────────────────────────────────────────────────────

export const billingPeriods = pgTable('billing_periods', {
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  isManualOverride: boolean('is_manual_override').notNull().default(false),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ── Invoices ──────────────────────────────────────────────────────────────

export const invoices = pgTable('invoices', {
  id: text('id').primaryKey(),
  allocationId: text('allocation_id')
    .notNull()
    .references(() => allocations.id),
  allocationName: text('allocation_name').notNull(),
  billingPeriodId: text('billing_period_id')
    .notNull()
    .references(() => billingPeriods.id),
  billingPeriodLabel: text('billing_period_label').notNull(),
  invoiceNumber: text('invoice_number'),
  invoiceDate: date('invoice_date').notNull(),
  subtotal: numeric('subtotal', { precision: 14, scale: 2 }).notNull(),
  vat: numeric('vat', { precision: 14, scale: 2 }).notNull(),
  gross: numeric('gross', { precision: 14, scale: 2 }).notNull(),
  paymentStatus: text('payment_status', {
    enum: ['PAID', 'OUTSTANDING', 'DRAFT'],
  }).notNull(),
  sageSyncedAt: timestamp('sage_synced_at'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ── Payments ─────────────────────────────────────────────────────────────

export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id')
    .notNull()
    .references(() => invoices.id),
  amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
  receivedAt: date('received_at').notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ── Sage Sync Log ─────────────────────────────────────────────────────────

export const sageSyncLog = pgTable('sage_sync_log', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id')
    .notNull()
    .references(() => invoices.id),
  invoiceNumber: text('invoice_number'),
  previousGross: numeric('previous_gross', { precision: 14, scale: 2 }),
  newGross: numeric('new_gross', { precision: 14, scale: 2 }),
  status: text('status', { enum: ['SUCCESS', 'FAILED'] }).notNull(),
  syncedAt: timestamp('synced_at').notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});
