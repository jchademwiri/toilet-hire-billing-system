// ─────────────────────────────────────────────────────────────────────────────
// Company configuration — EXAMPLE FILE
// ─────────────────────────────────────────────────────────────────────────────
// Copy this file to company.ts and customise the values below.
// company.ts is git-ignored so your custom values stay local.
//
//   cp src/config/company.example.ts src/config/company.ts
// ─────────────────────────────────────────────────────────────────────────────

export const company = {
  /* ── Brand identity ──────────────────────────────────────────────────── */
  /** Short logo text shown in the header/sidebar logo blocks */
  logoText: 'ACME',
  /** Display brand name (e.g. project code) */
  shortName: 'ACME-BILL',
  /** Tagline shown beneath the brand name */
  tagline: 'Billing System',

  /* ── Public-facing company / contract info ───────────────────────────── */
  /** Your company / contracting entity name */
  name: 'Your Company Name',
  /** The client you are billing on behalf of */
  client: 'Your Client',
  /** Contract reference displayed throughout the UI */
  contractReference: 'CT-2025/001',
  /** Short description of the service */
  description: 'Service Description',

  /* ── Coordinator labels (rename per client) ──────────────────────────── */
  /** Label shown in table column headers */
  coordinatorLabel: 'Client Coordinator',
  /** Plural page title */
  coordinatorsTitle: 'Client Coordinators',
  /** Description shown on the coordinators page */
  coordinatorsDescription: 'Client contacts assigned to allocations.',

  /* ── SEO / Metadata ──────────────────────────────────────────────────── */
  metadata: {
    title: 'Brand Name | Service Description',
    description:
      'Billing and operations system. Automated invoice generation, service tracking, and accounting integration.',
    keywords: [
      'billing system',
      'invoice management',
      'service tracking',
    ],
  },
} as const;
