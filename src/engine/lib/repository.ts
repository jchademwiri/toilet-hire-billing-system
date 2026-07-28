// ─────────────────────────────────────────────────────────────────────────────
// Data access repository — abstraction over data sources (mock vs. DB).
//
// Every page and engine function currently imports mock data directly from
// '@/lib/mock-data'.  This repository provides a single place to swap the
// data source: import from this file instead, and when the database is ready,
// change only these functions — not every page in the app.
//
// USAGE (now — mock data):
//   import { findAllInvoices, findPaymentsByInvoice } from '@/engine/lib/repository';
//
// USAGE (after DB migration):
//   // comment out mock-data imports, uncomment DB imports below
//   import { db } from '@/db';
//   import { invoices, payments } from '@/db/schema';
//   import { eq } from 'drizzle-orm';
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Contract,
  Region,
  CotCoordinator,
  Allocation,
  Area,
  Employee,
  ServiceSchedule,
  BillingPeriod,
  Invoice,
  Payment,
  SageSyncLog,
} from './schemas';

// ── 💡 Import from mock data (swap for DB when ready) ───────────────────────

import {
  contract as mockContract,
  regions as mockRegions,
  cotCoordinators as mockCotCoordinators,
  allocations as mockAllocations,
  areas as mockAreas,
  employees as mockEmployees,
  serviceSchedules as mockServiceSchedules,
  billingPeriods as mockBillingPeriods,
  invoices as mockInvoices,
  payments as mockPayments,
  sageSyncLog as mockSageSyncLog,
  employeeIdNumbers as mockEmployeeIdNumbers,
} from '@/lib/mock-data';

// ── Contract ─────────────────────────────────────────────────────────────────

export function getContract(): Contract {
  return mockContract;
}

// ── Regions ──────────────────────────────────────────────────────────────────

export function findAllRegions(): Region[] {
  return mockRegions;
}

// ── CoT Coordinators ─────────────────────────────────────────────────────────

export function findAllCotCoordinators(): CotCoordinator[] {
  return mockCotCoordinators;
}

export function findCotCoordinatorsByRegion(regionId: string): CotCoordinator[] {
  return mockCotCoordinators.filter((c) => c.regionId === regionId);
}

// ── Allocations ──────────────────────────────────────────────────────────────

export function findAllAllocations(): Allocation[] {
  return mockAllocations;
}

export function findAllocationById(id: string): Allocation | undefined {
  return mockAllocations.find((a) => a.id === id);
}

// ── Areas ────────────────────────────────────────────────────────────────────

export function findAreasByAllocation(allocationId: string): Area[] {
  return mockAreas.filter((a) => a.allocationId === allocationId);
}

// ── Employees ────────────────────────────────────────────────────────────────

export function findAllEmployees(): Employee[] {
  return mockEmployees;
}

export function findEmployeesByArea(areaId: string): Employee[] {
  return mockEmployees.filter((e) => e.areaId === areaId);
}

export function findEmployeesByAllocation(allocationId: string): Employee[] {
  const areaIds = new Set(
    mockAreas
      .filter((a) => a.allocationId === allocationId)
      .map((a) => a.id),
  );
  return mockEmployees.filter((e) => areaIds.has(e.areaId));
}

export function getEmployeeIdNumber(employeeId: string): string | undefined {
  return mockEmployeeIdNumbers[employeeId];
}

// ── Service Schedules ────────────────────────────────────────────────────────

export function findScheduleByAllocation(allocationId: string): ServiceSchedule | undefined {
  return mockServiceSchedules.find((s) => s.allocationId === allocationId);
}

// ── Billing Periods ──────────────────────────────────────────────────────────

export function findAllBillingPeriods(): BillingPeriod[] {
  return mockBillingPeriods;
}

export function findBillingPeriodById(id: string): BillingPeriod | undefined {
  return mockBillingPeriods.find((p) => p.id === id);
}

// ── Invoices ─────────────────────────────────────────────────────────────────

export function findAllInvoices(): Invoice[] {
  return mockInvoices;
}

export function findInvoiceById(id: string): Invoice | undefined {
  return mockInvoices.find((i) => i.id === id);
}

export function findInvoicesByAllocation(allocationId: string): Invoice[] {
  return mockInvoices.filter((i) => i.allocationId === allocationId);
}

// ── Payments ─────────────────────────────────────────────────────────────────

export function findAllPayments(): Payment[] {
  return mockPayments;
}

export function findPaymentsByInvoice(invoiceId: string): Payment[] {
  return mockPayments.filter((p) => p.invoiceId === invoiceId);
}

// ── Sage Sync Log ────────────────────────────────────────────────────────────

export function findAllSyncLogs(): SageSyncLog[] {
  return mockSageSyncLog;
}
