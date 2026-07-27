// ─────────────────────────────────────────────────────────────────────────────
// Company configuration
// ─────────────────────────────────────────────────────────────────────────────
// Edit this file to rebrand the system for any client.
// When forking the repo, copy company.example.ts → company.ts and customise.
// ─────────────────────────────────────────────────────────────────────────────

export const company = {
  /* ── Brand identity ──────────────────────────────────────────────────── */
  /** Path to the brand logo image in public/ (e.g. '/stp-logo.png') */
  logoPath: '/stp-logo.png',
  /** Path to the company signature image in public/ (e.g. '/muzi-signature.png') */
  signaturePath: '/muzi-signature.png',
  /** Display brand name (e.g. project code) */
  shortName: 'HS02',
  /** Tagline shown beneath the brand name */
  tagline: 'Billing System',

  /* ── Public-facing company / contract info ───────────────────────────── */
  /** Your company / contracting entity name */
  name: 'Sithembe Transportation and Projects (Pty) Ltd',
  /** The client you are billing on behalf of */
  client: 'City of Tshwane',
  /** Contract reference displayed throughout the UI */
  contractReference: 'HS 02-2025/26',
  /** Short description of the service */
  description: 'Chemical Toilet Hire',

  /* ── Coordinator labels (rename per client) ──────────────────────────── */
  /** Label shown in table column headers (e.g. "CoT Coordinator", "Client Coordinator") */
  coordinatorLabel: 'CoT Coordinator',
  /** Plural page title */
  coordinatorsTitle: 'CoT Coordinators',
  /** Description shown on the coordinators page */
  coordinatorsDescription: 'City of Tshwane municipal contacts assigned to allocations.',

  /* ── SEO / Metadata ──────────────────────────────────────────────────── */
  metadata: {
    title: 'HS02 Billing System | Chemical Toilet Hire Management',
    description:
      'Streamlined billing and operations system for chemical toilet hire services under contract HS 02-2025/26 with the City of Tshwane. Automated invoice generation, service tracking, and Sage integration.',
    keywords: [
      'toilet hire',
      'billing system',
      'chemical toilets',
      'City of Tshwane',
      'invoice management',
      'service tracking',
    ],
  },
} as const;
