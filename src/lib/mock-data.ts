// ─────────────────────────────────────────────────────────────────────────────
// Mock data — mirrors the full Drizzle schema from docs/HS02-Billing-System-Spec-v3.md
// Replace each entity with real DB queries once the schema migration is done.
// ─────────────────────────────────────────────────────────────────────────────

export const contract = {
  id: 'c-001',
  reference: 'HS 02-2025/26',
  client: 'City of Tshwane',
  rentalRate: 11.50,
  disabledRentalRate: null as number | null,
  serviceRate: 96.50,
  relocationRate: null as number | null,
  vatRate: 15,
  startDate: '2026-03-01',
  endDate: '2029-02-28',
  bankName: 'First National Bank',
  accountNumber: '62xxxxxxxxx',
  branchCode: '250655',
};

export const regions = [
  { id: 'r-001', contractId: 'c-001', name: 'Region 2' },
  { id: 'r-002', contractId: 'c-001', name: 'Region 5' },
];

export const cotCoordinators = [
  { id: 'cc-001', regionId: 'r-001', fullname: 'Thabo Dlamini', cellphone: '082 111 2222', email: 'tdlamini@tshwane.gov.za' },
  { id: 'cc-002', regionId: 'r-002', fullname: 'Bongi Nkosi', cellphone: '083 333 4444', email: 'bnkosi@tshwane.gov.za' },
  { id: 'cc-003', regionId: 'r-002', fullname: 'Sipho Mokoena', cellphone: '071 555 6666', email: 'smokoena@tshwane.gov.za' },
];

export const allocations = [
  {
    id: 'a-001',
    regionId: 'r-001',
    regionName: 'Region 2',
    cotCoordinatorId: 'cc-001',
    cotCoordinatorName: 'Thabo Dlamini',
    totalToilets: 120,
    deliveryDate: '2026-03-01',
    onboardingStatus: 'COMPLETE' as const,
  },
  {
    id: 'a-002',
    regionId: 'r-002',
    regionName: 'Region 5 — Site 1',
    cotCoordinatorId: 'cc-002',
    cotCoordinatorName: 'Bongi Nkosi',
    totalToilets: 80,
    deliveryDate: '2026-03-15',
    onboardingStatus: 'COMPLETE' as const,
  },
  {
    id: 'a-003',
    regionId: 'r-002',
    regionName: 'Region 5 — Leeuwfontein',
    cotCoordinatorId: 'cc-003',
    cotCoordinatorName: 'Sipho Mokoena',
    totalToilets: 60,
    deliveryDate: '2026-04-01',
    onboardingStatus: 'IN_PROGRESS' as const,
  },
];

export const areas = [
  { id: 'ar-001', allocationId: 'a-001', name: 'Soshanguve Block A', toiletCount: 40, siteCoordinatorId: 'e-001' },
  { id: 'ar-002', allocationId: 'a-001', name: 'Soshanguve Block K', toiletCount: 50, siteCoordinatorId: 'e-002' },
  { id: 'ar-003', allocationId: 'a-001', name: 'Mabopane Zone 3', toiletCount: 30, siteCoordinatorId: 'e-003' },
  { id: 'ar-004', allocationId: 'a-002', name: 'Mamelodi East', toiletCount: 50, siteCoordinatorId: 'e-004' },
  { id: 'ar-005', allocationId: 'a-002', name: 'Mamelodi West', toiletCount: 30, siteCoordinatorId: 'e-005' },
  { id: 'ar-006', allocationId: 'a-003', name: 'Leeuwfontein Ext 1', toiletCount: 35, siteCoordinatorId: 'e-006' },
  { id: 'ar-007', allocationId: 'a-003', name: 'Leeuwfontein Ext 2', toiletCount: 25, siteCoordinatorId: null },
];

export const employees = [
  { id: 'e-001', areaId: 'ar-001', fullname: 'Moses Sithole',   position: 'Coordinator' as const },
  { id: 'e-002', areaId: 'ar-002', fullname: 'Patricia Mokoena', position: 'Coordinator' as const },
  { id: 'e-003', areaId: 'ar-003', fullname: 'Joyce Mahlangu',  position: 'Coordinator' as const },
  { id: 'e-004', areaId: 'ar-004', fullname: 'Simon Ndlovu',    position: 'Coordinator' as const },
  { id: 'e-005', areaId: 'ar-005', fullname: 'Refilwe Tau',     position: 'Coordinator' as const },
  { id: 'e-006', areaId: 'ar-006', fullname: 'David Khumalo',   position: 'Coordinator' as const },
  { id: 'e-007', areaId: 'ar-001', fullname: 'Anna Dube',        position: 'Cleaner' as const },
  { id: 'e-008', areaId: 'ar-001', fullname: 'Busi Zulu',        position: 'Cleaner' as const },
  { id: 'e-009', areaId: 'ar-001', fullname: 'Carol Mthembu',   position: 'Cleaner' as const },
  { id: 'e-010', areaId: 'ar-001', fullname: 'Dineo Langa',     position: 'Cleaner' as const },
  { id: 'e-011', areaId: 'ar-002', fullname: 'Elsie Mabaso',    position: 'Cleaner' as const },
  { id: 'e-012', areaId: 'ar-002', fullname: 'Fiona Shabalala', position: 'Cleaner' as const },
  { id: 'e-013', areaId: 'ar-002', fullname: 'Grace Ntuli',     position: 'Cleaner' as const },
  { id: 'e-014', areaId: 'ar-003', fullname: 'Hlengiwe Vilane', position: 'Cleaner' as const },
  { id: 'e-015', areaId: 'ar-003', fullname: 'Irene Nkosi',     position: 'Cleaner' as const },
  { id: 'e-016', areaId: 'ar-004', fullname: 'Jane Mdlalose',   position: 'Cleaner' as const },
  { id: 'e-017', areaId: 'ar-004', fullname: 'Karen Dlamini',   position: 'Cleaner' as const },
  { id: 'e-018', areaId: 'ar-004', fullname: 'Lindiwe Msweli',  position: 'Cleaner' as const },
  { id: 'e-019', areaId: 'ar-005', fullname: 'Mary Buthelezi',  position: 'Cleaner' as const },
  { id: 'e-020', areaId: 'ar-005', fullname: 'Nomsa Cele',      position: 'Cleaner' as const },
  { id: 'e-021', areaId: 'ar-006', fullname: 'Olga Gumede',     position: 'Cleaner' as const },
  { id: 'e-022', areaId: 'ar-006', fullname: 'Portia Mkhize',   position: 'Cleaner' as const },
];

export const serviceSchedules = [
  { id: 'ss-001', allocationId: 'a-001', day1: 'Tuesday',  day2: 'Thursday', effectiveFrom: '2026-03-01', effectiveTo: null },
  { id: 'ss-002', allocationId: 'a-002', day1: 'Monday',   day2: 'Wednesday', effectiveFrom: '2026-03-15', effectiveTo: null },
  { id: 'ss-003', allocationId: 'a-003', day1: 'Wednesday', day2: 'Friday',   effectiveFrom: '2026-04-01', effectiveTo: null },
];

export const billingPeriods = [
  { id: 'bp-001', label: 'Mar 2026', periodStart: '2026-03-01', periodEnd: '2026-03-25', isManualOverride: false },
  { id: 'bp-002', label: 'Apr 2026', periodStart: '2026-03-26', periodEnd: '2026-04-25', isManualOverride: false },
  { id: 'bp-003', label: 'May 2026', periodStart: '2026-04-26', periodEnd: '2026-05-25', isManualOverride: false },
  { id: 'bp-004', label: 'Jun 2026', periodStart: '2026-05-26', periodEnd: '2026-06-30', isManualOverride: true },
  { id: 'bp-005', label: 'Jul 2026', periodStart: '2026-07-01', periodEnd: '2026-07-25', isManualOverride: true },
];

export const invoices = [
  {
    id: 'inv-001',
    allocationId: 'a-001',
    allocationName: 'Region 2',
    billingPeriodId: 'bp-003',
    billingPeriodLabel: 'May 2026',
    invoiceNumber: 'INV-2026-0041',
    invoiceDate: '2026-05-26',
    subtotal: 87420.00,
    vat: 13113.00,
    gross: 100533.00,
    paymentStatus: 'PAID' as const,
    sageSyncedAt: '2026-05-26T09:12:00Z',
  },
  {
    id: 'inv-002',
    allocationId: 'a-002',
    allocationName: 'Region 5 — Site 1',
    billingPeriodId: 'bp-003',
    billingPeriodLabel: 'May 2026',
    invoiceNumber: 'INV-2026-0042',
    invoiceDate: '2026-05-26',
    subtotal: 58280.00,
    vat: 8742.00,
    gross: 67022.00,
    paymentStatus: 'PAID' as const,
    sageSyncedAt: '2026-05-26T09-15-00Z',
  },
  {
    id: 'inv-003',
    allocationId: 'a-001',
    allocationName: 'Region 2',
    billingPeriodId: 'bp-004',
    billingPeriodLabel: 'Jun 2026',
    invoiceNumber: 'INV-2026-0055',
    invoiceDate: '2026-07-01',
    subtotal: 92640.00,
    vat: 13896.00,
    gross: 106536.00,
    paymentStatus: 'OUTSTANDING' as const,
    sageSyncedAt: '2026-07-01T10:00:00Z',
  },
  {
    id: 'inv-004',
    allocationId: 'a-002',
    allocationName: 'Region 5 — Site 1',
    billingPeriodId: 'bp-004',
    billingPeriodLabel: 'Jun 2026',
    invoiceNumber: 'INV-2026-0056',
    invoiceDate: '2026-07-01',
    subtotal: 61760.00,
    vat: 9264.00,
    gross: 71024.00,
    paymentStatus: 'OUTSTANDING' as const,
    sageSyncedAt: null,
  },
  {
    id: 'inv-005',
    allocationId: 'a-003',
    allocationName: 'Region 5 — Leeuwfontein',
    billingPeriodId: 'bp-004',
    billingPeriodLabel: 'Jun 2026',
    invoiceNumber: null,
    invoiceDate: '2026-07-01',
    subtotal: 43560.00,
    vat: 6534.00,
    gross: 50094.00,
    paymentStatus: 'DRAFT' as const,
    sageSyncedAt: null,
  },
];

export const payments = [
  { id: 'pay-001', invoiceId: 'inv-001', amount: 100533.00, receivedAt: '2026-06-18' },
  { id: 'pay-002', invoiceId: 'inv-002', amount: 67022.00, receivedAt: '2026-06-18' },
];

export const sageSyncLog = [
  {
    id: 'sl-001',
    invoiceId: 'inv-001',
    invoiceNumber: 'INV-2026-0041',
    previousGross: null,
    newGross: 100533.00,
    status: 'SUCCESS' as const,
    syncedAt: '2026-05-26T09:12:00Z',
  },
  {
    id: 'sl-002',
    invoiceId: 'inv-002',
    invoiceNumber: 'INV-2026-0042',
    previousGross: null,
    newGross: 67022.00,
    status: 'SUCCESS' as const,
    syncedAt: '2026-05-26T09:15:00Z',
  },
  {
    id: 'sl-003',
    invoiceId: 'inv-003',
    invoiceNumber: 'INV-2026-0055',
    previousGross: null,
    newGross: 106536.00,
    status: 'SUCCESS' as const,
    syncedAt: '2026-07-01T10:00:00Z',
  },
  {
    id: 'sl-004',
    invoiceId: 'inv-004',
    invoiceNumber: 'INV-2026-0056',
    previousGross: null,
    newGross: 71024.00,
    status: 'FAILED' as const,
    syncedAt: '2026-07-01T10:03:00Z',
  },
];

// ── Derived helpers ───────────────────────────────────────────────────────────

export function fmt(amount: number) {
  return `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export const totalActiveToilets = allocations.reduce((s, a) => s + a.totalToilets, 0);
export const totalOutstandingAR = invoices
  .filter((i) => i.paymentStatus === 'OUTSTANDING')
  .reduce((s, i) => s + i.gross, 0);
