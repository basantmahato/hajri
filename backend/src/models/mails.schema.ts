import { pgTable, serial, text, timestamp, integer, varchar } from 'drizzle-orm/pg-core';
import { users } from './users.schema.js';

export const mails = pgTable('mails', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  to: text('to').notNull(),
  from: text('from').notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  htmlBody: text('html_body'),
  cc: text('cc'),
  bcc: text('bcc'),
  status: text('status').notNull().default('pending'), // pending, sent, failed, delivered
  error: text('error'),
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  template: varchar('template', { length: 100 }),
  metadata: text('metadata'), // JSON string for additional data
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type MailSelect = typeof mails.$inferSelect;
export type MailInsert = typeof mails.$inferInsert;
