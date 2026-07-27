// ─────────────────────────────────────────────────────────────────────────────
// Mock data — mirrors the full Drizzle schema from docs/HS02-Billing-System-Spec-v3.md
// Data sourced from actual Tshwane-approved Excel workbooks in docs/excel-sheets/
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
  bankName: 'Nedbank Limited',
  accountNumber: '1323687157',
  branchCode: '198765',

  // ── Service provider letterhead (matches the Tshwane-approved document headers) ──
  vatNumber: '4070272101',
  vendorNumber: '101776',
  regNo: '2013/029173/07',
  addressLines: ['285 Erasmus Ave', 'Raslouw AH', 'Centurion', '0157'],
  tel: '012 880 3155',
  cell: '073 124 1535',
  fax: '086 603 7935',
  email: 'accounts@sithembe.co.za',
  emailAlt: 'info@sithembe.co.za',
  website: 'www.sithembe.co.za',

  // ── Client (City of Tshwane) letterhead details ──
  clientVatNumber: '4000142267',
  clientAddressLines: ['PO Box 6338', 'Pretoria', '0001'],
  clientTel: '012 358 3368',
};

export const regions = [
  { id: 'r-001', contractId: 'c-001', name: 'Region 1' },
  { id: 'r-002', contractId: 'c-001', name: 'Region 2' },
  { id: 'r-003', contractId: 'c-001', name: 'Region 3' },
  { id: 'r-004', contractId: 'c-001', name: 'Region 4' },
  { id: 'r-005', contractId: 'c-001', name: 'Region 5' },
  { id: 'r-006', contractId: 'c-001', name: 'Region 6' },
  { id: 'r-007', contractId: 'c-001', name: 'Region 7' },
];

export const cotCoordinators = [
  { id: 'cc-001', regionId: 'r-002', fullname: 'Thoko Maluka', cellphone: '082 111 2222', email: 'tmaluka@tshwane.gov.za' },
  { id: 'cc-002', regionId: 'r-005', fullname: 'Johannes Mtshweni', cellphone: '083 333 4444', email: 'jmtshweni@tshwane.gov.za' },
  { id: 'cc-003', regionId: 'r-005', fullname: 'Sipho Mokoena', cellphone: '071 555 6666', email: 'smokoena@tshwane.gov.za' },
  { id: 'cc-004', regionId: 'r-001', fullname: 'Lindiwe Zulu', cellphone: '072 777 8888', email: 'lzulu@tshwane.gov.za' },
  { id: 'cc-005', regionId: 'r-003', fullname: 'Mpho Selepe', cellphone: '073 888 9999', email: 'mselepe@tshwane.gov.za' },
  { id: 'cc-006', regionId: 'r-004', fullname: 'Nomsa Khumalo', cellphone: '074 999 0000', email: 'nkhumalo@tshwane.gov.za' },
  { id: 'cc-007', regionId: 'r-006', fullname: 'Bongani Motha', cellphone: '075 000 1111', email: 'bmotha@tshwane.gov.za' },
  { id: 'cc-008', regionId: 'r-007', fullname: 'Refilwe Mogale', cellphone: '076 111 2222', email: 'rmogale@tshwane.gov.za' },
];

export const allocations = [
  {
    id: 'a-001',
    regionId: 'r-002',
    regionName: 'Region 2',
    cotCoordinatorId: 'cc-001',
    cotCoordinatorName: 'Thoko Maluka',
    totalToilets: 596,
    deliveryDate: '2026-03-01',
    onboardingStatus: 'COMPLETE' as const,
  },
  {
    id: 'a-002',
    regionId: 'r-005',
    regionName: 'Region 5',
    cotCoordinatorId: 'cc-002',
    cotCoordinatorName: 'Johannes Mtshweni',
    totalToilets: 35,
    deliveryDate: '2026-03-15',
    onboardingStatus: 'COMPLETE' as const,
  },
  {
    id: 'a-003',
    regionId: 'r-005',
    regionName: 'Region 5',
    cotCoordinatorId: 'cc-003',
    cotCoordinatorName: 'Sipho Mokoena',
    totalToilets: 20,
    deliveryDate: '2026-07-01',
    onboardingStatus: 'COMPLETE' as const,
  },
];

// ── Real areas from actual July 2026 invoices ────────────────────────────────
// Source: docs/excel-sheets/
// GPS coordinates are approximate (decimal) for the area locations near Tshwane
export const areas = [
  // Region 2 — 13 areas, 596 toilets total
  // rowNumber matches the actual row numbering used on the Tshwane-approved invoice
  // (source skips 2 and 5 — areas removed from the contract before this numbering was fixed).
  { id: 'ar-001', allocationId: 'a-001', name: 'Themba View Ext 1', toiletCount: 8, siteCoordinatorId: 'e-001', lat: -25.4020, lng: 28.2940, rowNumber: 1 },
  { id: 'ar-002', allocationId: 'a-001', name: 'Marokolong', toiletCount: 11, siteCoordinatorId: 'e-002', lat: -25.3740, lng: 28.1160, rowNumber: 3 },
  { id: 'ar-003', allocationId: 'a-001', name: 'Hammanskraal Ext 4', toiletCount: 30, siteCoordinatorId: 'e-003', lat: -25.3920, lng: 28.2830, rowNumber: 4 },
  { id: 'ar-004', allocationId: 'a-001', name: 'Hammanskraal portion 9 & 10', toiletCount: 160, siteCoordinatorId: 'e-004', lat: -25.3890, lng: 28.2790, rowNumber: 6 },
  { id: 'ar-005', allocationId: 'a-001', name: 'Soshanguve X Buffer C', toiletCount: 50, siteCoordinatorId: 'e-005', lat: -25.5240, lng: 28.1030, rowNumber: 7 },
  { id: 'ar-006', allocationId: 'a-001', name: 'Soshanguve X Buffer D', toiletCount: 60, siteCoordinatorId: 'e-006', lat: -25.5260, lng: 28.1050, rowNumber: 8 },
  { id: 'ar-007', allocationId: 'a-001', name: 'Soshanguve X Buffer Civcon', toiletCount: 10, siteCoordinatorId: 'e-007', lat: -25.5280, lng: 28.1070, rowNumber: 9 },
  { id: 'ar-008', allocationId: 'a-001', name: 'Dali Mpofu', toiletCount: 40, siteCoordinatorId: 'e-008', lat: -25.5120, lng: 28.0980, rowNumber: 10 },
  { id: 'ar-009', allocationId: 'a-001', name: 'Stinkwater', toiletCount: 3, siteCoordinatorId: 'e-009', lat: -25.5400, lng: 28.1120, rowNumber: 11 },
  { id: 'ar-010', allocationId: 'a-001', name: 'Stinkwater Ext 10', toiletCount: 70, siteCoordinatorId: 'e-010', lat: -25.5430, lng: 28.1150, rowNumber: 12 },
  { id: 'ar-011', allocationId: 'a-001', name: 'Chris Hani', toiletCount: 80, siteCoordinatorId: 'e-011', lat: -25.5580, lng: 28.1200, rowNumber: 13 },
  { id: 'ar-012', allocationId: 'a-001', name: 'Phomolong Phase 1', toiletCount: 59, siteCoordinatorId: 'e-012', lat: -25.4980, lng: 28.0880, rowNumber: 14 },
  { id: 'ar-013', allocationId: 'a-001', name: 'Greenfield Ext 14', toiletCount: 15, siteCoordinatorId: 'e-013', lat: -25.4860, lng: 28.0950, rowNumber: 15 },

  // Region 5 — 3 areas, 35 toilets total
  { id: 'ar-014', allocationId: 'a-002', name: 'Wallmansthall Berlin', toiletCount: 22, siteCoordinatorId: 'e-014', lat: -25.7450, lng: 28.3850, rowNumber: 1 },
  { id: 'ar-015', allocationId: 'a-002', name: 'Rayton Plot 121', toiletCount: 1, siteCoordinatorId: 'e-015', lat: -25.7380, lng: 28.4240, rowNumber: 2 },
  { id: 'ar-016', allocationId: 'a-002', name: 'Pienaarspoort Ext 22', toiletCount: 12, siteCoordinatorId: 'e-016', lat: -25.7300, lng: 28.3920, rowNumber: 3 },

  // Region 5 — 2 phases (July: staggered delivery 1st & 4th)
  { id: 'ar-017', allocationId: 'a-003', name: 'Leeuwfontein Ext 32 (Phase 1)', toiletCount: 10, siteCoordinatorId: 'e-017', lat: -25.7700, lng: 28.4520, rowNumber: 1 },
  { id: 'ar-018', allocationId: 'a-003', name: 'Leeuwfontein Ext 32 (Phase 2)', toiletCount: 10, siteCoordinatorId: 'e-017', lat: -25.7700, lng: 28.4520, rowNumber: 2 },
];

export const employees = [
  // Region 2 — Site coordinators (one per area)
  { id: 'e-001', areaId: 'ar-001', fullname: 'Moses Sithole',   position: 'Coordinator' as const },
  { id: 'e-002', areaId: 'ar-002', fullname: 'Patricia Mokoena', position: 'Coordinator' as const },
  { id: 'e-003', areaId: 'ar-003', fullname: 'Joyce Mahlangu',  position: 'Coordinator' as const },
  { id: 'e-004', areaId: 'ar-004', fullname: 'Simon Ndlovu',    position: 'Coordinator' as const },
  { id: 'e-005', areaId: 'ar-005', fullname: 'Refilwe Tau',     position: 'Coordinator' as const },
  { id: 'e-006', areaId: 'ar-006', fullname: 'David Khumalo',   position: 'Coordinator' as const },
  { id: 'e-007', areaId: 'ar-007', fullname: 'Anna Dube',        position: 'Coordinator' as const },
  { id: 'e-008', areaId: 'ar-008', fullname: 'Thabo Nkosi',      position: 'Coordinator' as const },
  { id: 'e-009', areaId: 'ar-009', fullname: 'Busi Zulu',        position: 'Coordinator' as const },
  { id: 'e-010', areaId: 'ar-010', fullname: 'Carol Mthembu',   position: 'Coordinator' as const },
  { id: 'e-011', areaId: 'ar-011', fullname: 'Dineo Langa',     position: 'Coordinator' as const },
  { id: 'e-012', areaId: 'ar-012', fullname: 'Elsie Mabaso',    position: 'Coordinator' as const },
  { id: 'e-013', areaId: 'ar-013', fullname: 'Fiona Shabalala', position: 'Coordinator' as const },

  // Region 2 — Cleaners
  { id: 'e-101', areaId: 'ar-001', fullname: 'Grace Ntuli',     position: 'Cleaner' as const },
  { id: 'e-102', areaId: 'ar-001', fullname: 'Hlengiwe Vilane', position: 'Cleaner' as const },
  { id: 'e-103', areaId: 'ar-002', fullname: 'Irene Nkosi',     position: 'Cleaner' as const },
  { id: 'e-104', areaId: 'ar-002', fullname: 'Jane Mdlalose',   position: 'Cleaner' as const },
  { id: 'e-105', areaId: 'ar-003', fullname: 'Karen Dlamini',   position: 'Cleaner' as const },
  { id: 'e-106', areaId: 'ar-003', fullname: 'Lindiwe Msweli',  position: 'Cleaner' as const },
  { id: 'e-107', areaId: 'ar-004', fullname: 'Mary Buthelezi',  position: 'Cleaner' as const },
  { id: 'e-108', areaId: 'ar-004', fullname: 'Nomsa Cele',      position: 'Cleaner' as const },
  { id: 'e-109', areaId: 'ar-005', fullname: 'Olga Gumede',     position: 'Cleaner' as const },
  { id: 'e-110', areaId: 'ar-005', fullname: 'Portia Mkhize',   position: 'Cleaner' as const },
  { id: 'e-111', areaId: 'ar-006', fullname: 'Sarah Zondi',     position: 'Cleaner' as const },
  { id: 'e-112', areaId: 'ar-006', fullname: 'Thandi Mkhabela', position: 'Cleaner' as const },
  { id: 'e-113', areaId: 'ar-007', fullname: 'Unity Motaung',   position: 'Cleaner' as const },
  { id: 'e-114', areaId: 'ar-008', fullname: 'Victoria Mhlongo', position: 'Cleaner' as const },
  { id: 'e-115', areaId: 'ar-009', fullname: 'Winnie Mahlangu', position: 'Cleaner' as const },
  { id: 'e-116', areaId: 'ar-010', fullname: 'Xoliswa Nxumalo', position: 'Cleaner' as const },
  { id: 'e-117', areaId: 'ar-011', fullname: 'Yolanda Mokoena', position: 'Cleaner' as const },
  { id: 'e-118', areaId: 'ar-012', fullname: 'Zanele Mthembu',  position: 'Cleaner' as const },
  { id: 'e-119', areaId: 'ar-013', fullname: 'Amanda Zulu',     position: 'Cleaner' as const },

  // Region 5 coordinators & cleaners
  { id: 'e-014', areaId: 'ar-014', fullname: 'Bongani Dlamini', position: 'Coordinator' as const },
  { id: 'e-015', areaId: 'ar-015', fullname: 'Sipho Zungu',     position: 'Coordinator' as const },
  { id: 'e-016', areaId: 'ar-016', fullname: 'Nomsa Khumalo',   position: 'Coordinator' as const },
  { id: 'e-120', areaId: 'ar-014', fullname: 'Phindile Ndlovu', position: 'Cleaner' as const },
  { id: 'e-121', areaId: 'ar-015', fullname: 'Jabu Shabangu',   position: 'Cleaner' as const },
  { id: 'e-122', areaId: 'ar-016', fullname: 'Naledi Moeketsi', position: 'Cleaner' as const },

  // Region 5
  { id: 'e-017', areaId: 'ar-017', fullname: 'Samuel Mokoena',  position: 'Coordinator' as const },
  { id: 'e-123', areaId: 'ar-017', fullname: 'Mathabo Moabi',   position: 'Cleaner' as const },
  { id: 'e-124', areaId: 'ar-017', fullname: 'Katlego Mokoena', position: 'Cleaner' as const },
];

// ── Restricted table: employee ID numbers ────────────────────────────────────
// POPIA-protected — deliberately kept out of the `employees` export above and
// only looked up by the EPWP Employee List document (the one Excel-approved
// document that requires it). Values here are fabricated placeholders, not
// real ID numbers — replace via the restricted table once the real migration
// runs (see HS02-Data-Handling-POPIA.md).
export const employeeIdNumbers: Record<string, string> = Object.fromEntries(
  employees.map((e, i) => [e.id, `${8000000000000 + i * 137}`]),
);

export const serviceSchedules = [
  { id: 'ss-001', allocationId: 'a-001', day1: 'Monday',   day2: 'Thursday',  effectiveFrom: '2026-03-01', effectiveTo: null },
  { id: 'ss-002', allocationId: 'a-002', day1: 'Tuesday',  day2: 'Friday',    effectiveFrom: '2026-03-15', effectiveTo: null },
  { id: 'ss-003', allocationId: 'a-003', day1: 'Wednesday', day2: 'Friday',    effectiveFrom: '2026-07-01', effectiveTo: null },
];

export const billingPeriods = [
  { id: 'bp-001', label: 'Mar 2026', periodStart: '2026-03-01', periodEnd: '2026-03-25', isManualOverride: false },
  { id: 'bp-002', label: 'Apr 2026', periodStart: '2026-03-26', periodEnd: '2026-04-25', isManualOverride: false },
  { id: 'bp-003', label: 'May 2026', periodStart: '2026-04-26', periodEnd: '2026-05-25', isManualOverride: false },
  { id: 'bp-004', label: 'Jun 2026', periodStart: '2026-05-26', periodEnd: '2026-06-30', isManualOverride: true },
  { id: 'bp-005', label: 'Jul 2026', periodStart: '2026-07-01', periodEnd: '2026-07-25', isManualOverride: true },
];

// ── Real invoices from actual Excel workbooks ───────────────────────────────
// Source: docs/excel-sheets/ (May, June, July folders)
//
// May 2026:   STP-INV-26-0377/0378
// Jun 2026:   STP-INV-26-0388/0389
// Jul 2026:   STP-INV-26-0396/0397/0398
export const invoices = [
  // ── March 2026 (period 1 Mar – 25 Mar — first month, fully paid) ──
  {
    id: 'inv-009',
    allocationId: 'a-001',
    allocationName: 'Region 2',
    billingPeriodId: 'bp-001',
    billingPeriodLabel: 'Mar 2026',
    invoiceNumber: 'STP-INV-26-0378',
    invoiceDate: '2026-03-26',
    subtotal: 573948.00,
    vat: 86092.20,
    gross: 660040.20,
    paymentStatus: 'PAID' as const,
    sageSyncedAt: '2026-03-26T09:12:00Z',
  },
  {
    id: 'inv-010',
    allocationId: 'a-002',
    allocationName: 'Region 5',
    billingPeriodId: 'bp-001',
    billingPeriodLabel: 'Mar 2026',
    invoiceNumber: 'STP-INV-26-0377',
    invoiceDate: '2026-03-26',
    subtotal: 33705.00,
    vat: 5055.75,
    gross: 38760.75,
    paymentStatus: 'PAID' as const,
    sageSyncedAt: '2026-03-26T09:15:00Z',
  },

  // ── May 2026 (period 26 Apr – 25 May) ──
  {
    id: 'inv-001',
    allocationId: 'a-001',
    allocationName: 'Region 2',
    billingPeriodId: 'bp-003',
    billingPeriodLabel: 'May 2026',
    invoiceNumber: 'STP-INV-26-0378',
    invoiceDate: '2026-05-26',
    subtotal: 723246.00,
    vat: 108486.90,
    gross: 831732.90,
    paymentStatus: 'OUTSTANDING' as const,
    sageSyncedAt: null,
  },
  {
    id: 'inv-002',
    allocationId: 'a-002',
    allocationName: 'Region 5',
    billingPeriodId: 'bp-003',
    billingPeriodLabel: 'May 2026',
    invoiceNumber: 'STP-INV-26-0377',
    invoiceDate: '2026-05-26',
    subtotal: 39095.00,
    vat: 5864.25,
    gross: 44959.25,
    paymentStatus: 'OUTSTANDING' as const,
    sageSyncedAt: null,
  },

  // ── June 2026 (period 26 May – 30 Jun, manual override for CoT year-end) ──
  {
    id: 'inv-003',
    allocationId: 'a-001',
    allocationName: 'Region 2',
    billingPeriodId: 'bp-004',
    billingPeriodLabel: 'Jun 2026',
    invoiceNumber: 'STP-INV-26-0389',
    invoiceDate: '2026-06-30',
    subtotal: 879398.00,
    vat: 131909.70,
    gross: 1011307.70,
    paymentStatus: 'OUTSTANDING' as const,
    sageSyncedAt: '2026-06-30T10:00:00Z',
  },
  {
    id: 'inv-004',
    allocationId: 'a-002',
    allocationName: 'Region 5',
    billingPeriodId: 'bp-004',
    billingPeriodLabel: 'Jun 2026',
    invoiceNumber: 'STP-INV-26-0388',
    invoiceDate: '2026-06-30',
    subtotal: 51642.50,
    vat: 7746.38,
    gross: 59388.88,
    paymentStatus: 'OUTSTANDING' as const,
    sageSyncedAt: null,
  },


  // ── July 2026 (period 1 Jul – 25 Jul, manual override) ──
  {
    id: 'inv-006',
    allocationId: 'a-001',
    allocationName: 'Region 2',
    billingPeriodId: 'bp-005',
    billingPeriodLabel: 'Jul 2026',
    invoiceNumber: 'STP-INV-26-0396',
    invoiceDate: '2026-07-26',
    subtotal: 573948.00,
    vat: 86092.20,
    gross: 660040.20,
    paymentStatus: 'OUTSTANDING' as const,
    sageSyncedAt: null,
  },
  {
    id: 'inv-007',
    allocationId: 'a-002',
    allocationName: 'Region 5',
    billingPeriodId: 'bp-005',
    billingPeriodLabel: 'Jul 2026',
    invoiceNumber: 'STP-INV-26-0397',
    invoiceDate: '2026-07-26',
    subtotal: 33705.00,
    vat: 5055.75,
    gross: 38760.75,
    paymentStatus: 'OUTSTANDING' as const,
    sageSyncedAt: null,
  },
  {
    id: 'inv-008',
    allocationId: 'a-003',
    allocationName: 'Region 5',
    billingPeriodId: 'bp-005',
    billingPeriodLabel: 'Jul 2026',
    invoiceNumber: 'STP-INV-26-0398',
    invoiceDate: '2026-07-26',
    subtotal: 18915.00,
    vat: 2837.25,
    gross: 21752.25,
    paymentStatus: 'OUTSTANDING' as const,
    sageSyncedAt: null,
  },
];

export const payments = [
  { id: 'pay-001', invoiceId: 'inv-009', amount: 660040.20, receivedAt: '2026-04-15' },
  { id: 'pay-002', invoiceId: 'inv-010', amount: 38760.75, receivedAt: '2026-04-15' },
];

export const sageSyncLog = [
  {
    id: 'sl-005',
    invoiceId: 'inv-009',
    invoiceNumber: 'STP-INV-26-0378',
    previousGross: null,
    newGross: 660040.20,
    status: 'SUCCESS' as const,
    syncedAt: '2026-03-26T09:12:00Z',
  },
  {
    id: 'sl-006',
    invoiceId: 'inv-010',
    invoiceNumber: 'STP-INV-26-0377',
    previousGross: null,
    newGross: 38760.75,
    status: 'SUCCESS' as const,
    syncedAt: '2026-03-26T09:15:00Z',
  },
  {
    id: 'sl-003',
    invoiceId: 'inv-003',
    invoiceNumber: 'STP-INV-26-0389',
    previousGross: null,
    newGross: 661411.00,
    status: 'SUCCESS' as const,
    syncedAt: '2026-07-01T10:00:00Z',
  },
  {
    id: 'sl-004',
    invoiceId: 'inv-004',
    invoiceNumber: 'STP-INV-26-0388',
    previousGross: null,
    newGross: 59388.88,
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
