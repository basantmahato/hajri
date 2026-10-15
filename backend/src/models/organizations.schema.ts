import { pgTable, serial, text, timestamp, varchar, boolean, integer } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  type: text('type').notNull().default('retail'), // retail, cafe, restaurant, office, etc.
  industry: text('industry'),
  description: text('description'),
  logo: text('logo'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  country: text('country'),
  postalCode: varchar('postal_code', { length: 20 }),
  phone: varchar('phone', { length: 20 }),
  email: text('email'),
  website: text('website'),
  ownerId: integer('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  isActive: boolean('is_active').notNull().default(true),
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  settings: text('settings'), // JSON string for custom settings
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type OrganizationSelect = typeof organizations.$inferSelect;
export type OrganizationInsert = typeof organizations.$inferInsert;
