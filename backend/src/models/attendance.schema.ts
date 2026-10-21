import { pgTable, serial, text, timestamp, integer, varchar, boolean, time } from 'drizzle-orm/pg-core';
import { users } from './users.schema.js';
import { organizations } from './organizations.schema.js';

export const attendance = pgTable('attendance', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  checkInTime: time('check_in_time'),
  checkOutTime: time('check_out_time'),
  checkInLocation: text('check_in_location'), // GPS coordinates or address
  checkOutLocation: text('check_out_location'),
  checkInMethod: varchar('check_in_method', { length: 50 }), // biometric, manual, gps, qr_code
  checkOutMethod: varchar('check_out_method', { length: 50 }),
  status: text('status').notNull().default('present'), // present, absent, late, half_day, leave
  workHours: varchar('work_hours', { length: 10 }), // Total hours worked
  overtimeHours: varchar('overtime_hours', { length: 10 }),
  notes: text('notes'),
  isLate: boolean('is_late').notNull().default(false),
  approvedBy: integer('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type AttendanceSelect = typeof attendance.$inferSelect;
export type AttendanceInsert = typeof attendance.$inferInsert;
