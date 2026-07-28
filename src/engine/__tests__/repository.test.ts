import { describe, it, expect } from 'vitest';
import {
  getContract,
  findAllRegions,
  findAllAllocations,
  findAllocationById,
  findAreasByAllocation,
  findAllEmployees,
  findEmployeesByAllocation,
  findScheduleByAllocation,
  findAllBillingPeriods,
  findAllInvoices,
  findInvoiceById,
  findInvoicesByAllocation,
  findAllPayments,
  findPaymentsByInvoice,
} from '../lib/repository';

describe('repository — Contract', () => {
  it('returns the contract with correct reference', () => {
    const contract = getContract();
    expect(contract.reference).toBe('HS 02-2025/26');
    expect(contract.client).toBe('City of Tshwane');
    expect(contract.rentalRate).toBe(11.50);
  });
});

describe('repository — Regions', () => {
  it('returns 7 regions', () => {
    const regions = findAllRegions();
    expect(regions).toHaveLength(7);
  });
});

describe('repository — Allocations', () => {
  it('returns 3 allocations', () => {
    const allocs = findAllAllocations();
    expect(allocs).toHaveLength(3);
  });

  it('finds allocation by ID', () => {
    const alloc = findAllocationById('a-001');
    expect(alloc).toBeDefined();
    expect(alloc?.regionName).toBe('Region 2');
  });

  it('returns undefined for unknown ID', () => {
    expect(findAllocationById('unknown')).toBeUndefined();
  });
});

describe('repository — Areas', () => {
  it('returns 13 areas for Region 2', () => {
    const areas = findAreasByAllocation('a-001');
    expect(areas).toHaveLength(13);
  });

  it('returns 3 areas for Region 5 (Site 1)', () => {
    const areas = findAreasByAllocation('a-002');
    expect(areas).toHaveLength(3);
  });
});

describe('repository — Employees', () => {
  it('returns all employees', () => {
    const emps = findAllEmployees();
    expect(emps.length).toBeGreaterThan(30);
  });

  it('returns employees for Region 2', () => {
    const emps = findEmployeesByAllocation('a-001');
    expect(emps.length).toBeGreaterThan(0);
  });

  it('returns empty for unknown allocation', () => {
    const emps = findEmployeesByAllocation('unknown');
    expect(emps).toEqual([]);
  });
});

describe('repository — Service Schedules', () => {
  it('returns schedule for each allocation', () => {
    const s1 = findScheduleByAllocation('a-001');
    expect(s1?.day1).toBe('Monday');
    expect(s1?.day2).toBe('Thursday');
  });

  it('returns undefined for unknown allocation', () => {
    expect(findScheduleByAllocation('unknown')).toBeUndefined();
  });
});

describe('repository — Billing Periods', () => {
  it('returns 5 billing periods', () => {
    const periods = findAllBillingPeriods();
    expect(periods).toHaveLength(5);
  });
});

describe('repository — Invoices', () => {
  it('returns all invoices', () => {
    const invs = findAllInvoices();
    expect(invs.length).toBeGreaterThan(0);
  });

  it('finds invoice by ID', () => {
    const inv = findInvoiceById('inv-001');
    expect(inv).toBeDefined();
    expect(inv?.invoiceNumber).toBe('STP-INV-26-0378');
  });

  it('finds invoices by allocation', () => {
    const invs = findInvoicesByAllocation('a-001');
    expect(invs.length).toBeGreaterThan(0);
    expect(invs.every((i) => i.allocationId === 'a-001')).toBe(true);
  });
});

describe('repository — Payments', () => {
  it('returns all payments', () => {
    const pays = findAllPayments();
    expect(pays).toHaveLength(2);
  });

  it('finds payments by invoice', () => {
    const pays = findPaymentsByInvoice('inv-009');
    expect(pays.length).toBe(1);
    expect(pays[0].amount).toBe(660040.20);
  });

  it('returns empty for invoice with no payments', () => {
    expect(findPaymentsByInvoice('inv-001')).toEqual([]);
  });
});
