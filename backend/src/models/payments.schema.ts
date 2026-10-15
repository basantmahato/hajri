import { pgTable, serial, text, timestamp, decimal, integer, varchar } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  orderId: integer('order_id'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  status: text('status').notNull().default('pending'), // pending, completed, failed, refunded
  paymentMethod: text('payment_method').notNull(), // credit_card, debit_card, paypal, bank_transfer
  transactionId: text('transaction_id').unique(),
  paymentDate: timestamp('payment_date'),
  refundDate: timestamp('refund_date'),
  metadata: text('metadata'), // JSON string for additional data
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type PaymentSelect = typeof payments.$inferSelect;
export type PaymentInsert = typeof payments.$inferInsert;
