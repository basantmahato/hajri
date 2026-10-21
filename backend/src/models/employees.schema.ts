import { pgTable, serial, text, timestamp, integer, varchar, boolean, decimal, date, type AnyPgColumn } from 'drizzle-orm/pg-core';
import { users } from './users.schema.js';
import { organizations } from './organizations.schema.js';

export const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: integer('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  employeeId: varchar('employee_id', { length: 50 }).notNull().unique(), // Custom employee ID like EMP001
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  dateOfBirth: date('date_of_birth'),
  gender: text('gender'), // male, female, other, prefer_not_to_say
  phoneNumber: varchar('phone_number', { length: 20 }),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  postalCode: varchar('postal_code', { length: 20 }),
  department: text('department'),
  position: text('position').notNull(),
  employmentType: text('employment_type').notNull().default('full-time'), // full-time, part-time, contract, intern
  status: text('status').notNull().default('active'), // active, inactive, terminated, on_leave
  joiningDate: date('joining_date').notNull(),
  leavingDate: date('leaving_date'),
  salary: decimal('salary', { precision: 10, scale: 2 }),
  salaryType: text('salary_type').notNull().default('monthly'), // monthly, daily, hourly
  workDays: text('work_days'), // JSON array: ["monday", "tuesday", ...]
  workHours: varchar('work_hours', { length: 10 }), // "9:00-18:00"
  managerId: integer('manager_id').references((): AnyPgColumn => employees.id, { onDelete: 'set null' }),
  emergencyContactName: text('emergency_contact_name'),
  emergencyContactPhone: varchar('emergency_contact_phone', { length: 20 }),
  emergencyContactRelation: text('emergency_contact_relation'),
  documents: text('documents'), // JSON string for document URLs
  notes: text('notes'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type EmployeeSelect = typeof employees.$inferSelect;
export type EmployeeInsert = typeof employees.$inferInsert;
