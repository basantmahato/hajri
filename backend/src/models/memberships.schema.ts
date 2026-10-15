import { pgTable, serial, text, timestamp, integer, varchar, boolean } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { organizations } from './organizations.schema';

export const memberships = pgTable('memberships', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('member'), // owner, admin, manager, employee, member
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
