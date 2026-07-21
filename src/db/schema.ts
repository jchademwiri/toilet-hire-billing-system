import { sql } from 'drizzle-orm';
import { serial, text, timestamp, integer, boolean, pgTable } from 'drizzle-orm/pg-core';

// Example table - modify as needed for your toilet hire billing system
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const rentals = pgTable('rentals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  quantity: integer('quantity').notNull(),
  totalCost: integer('total_cost').notNull(),
  isPaid: boolean('is_paid').default(false),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
});
