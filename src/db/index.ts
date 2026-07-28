// ─────────────────────────────────────────────────────────────────────────────
// Drizzle database connection
// ─────────────────────────────────────────────────────────────────────────────
// To connect to your Neon database:
//   1. Create a .env.local file with DATABASE_URL=postgresql://...
//   2. Uncomment the code below
//   3. Run  bun drizzle-kit push  to sync the schema
//   4. Replace  import { ... } from '@/lib/mock-data'  with  import { db } from '@/db'
//
// Until the database is provisioned, the app runs on mock data from
// src/lib/mock-data.ts.  The db object below is exported but calling it
// without a DATABASE_URL will throw — that's intentional: it catches
// accidental use before the real database is ready.
//
// src/db/schema.ts  already mirrors the Zod types in engine/lib/schemas.ts,
// so when you flip the switch, the types are already aligned.
//
// ─────────────────────────────────────────────────────────────────────────────

// import { neon } from '@neondatabase/serverless';
// import { drizzle } from 'drizzle-orm/neon-http';
// import * as schema from '@/db/schema';

// const sql = neon(process.env.DATABASE_URL!);
// export const db = drizzle({ client: sql, schema });

/**
 * Helper to check whether a DATABASE_URL is configured.
 * Returns true once the environment variable is set.
 */
export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}
