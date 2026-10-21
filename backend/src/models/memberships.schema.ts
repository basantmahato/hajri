import { pgTable, serial, text, timestamp, integer, boolean, decimal } from 'drizzle-orm/pg-core';
import { users } from './users.schema.js';
import { organizations } from './organizations.schema.js';

export const memberships = pgTable('memberships', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('member'), // owner, admin, manager, employee, member
  dailyWage: decimal('daily_wage', { precision: 10, scale: 2 }), // Per-day wage for attendance-based pay
  status: text('status').notNull().default('active'), // active, inactive, suspended, pending
  permissions: text('permissions'), // JSON string for custom permissions
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  invitedBy: integer('invited_by').references(() => users.id, { onDelete: 'set null' }),
  isDefault: boolean('is_default').notNull().default(false), // For multi-org users
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type MembershipSelect = typeof memberships.$inferSelect;
export type MembershipInsert = typeof memberships.$inferInsert;
