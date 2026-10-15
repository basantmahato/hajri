import { pgTable, serial, text, timestamp, decimal, integer, varchar, boolean } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  status: text('status').notNull().default('pending'), // pending, confirmed, processing, shipped, delivered, cancelled
  orderDate: timestamp('order_date').notNull().defaultNow(),
  shippingDate: timestamp('shipping_date'),
  deliveryDate: timestamp('delivery_date'),
  shippingAddress: text('shipping_address'),
  billingAddress: text('billing_address'),
  notes: text('notes'),
  isPaid: boolean('is_paid').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type OrderSelect = typeof orders.$inferSelect;
export type OrderInsert = typeof orders.$inferInsert;
