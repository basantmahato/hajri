import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { logger } from '../utils/logger.js';
import * as schema from '../models/index.js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const connectionString = process.env.DATABASE_URL;

const maskPassword = (url: string): string => {
  try {
    const urlObj = new URL(url);
    urlObj.password = '***';
    return urlObj.toString();
  } catch {
    return url;
  }
};

logger.info(`Database URL: ${maskPassword(connectionString)}`);

const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  onnotice: (notice) => {
    logger.info(`PostgreSQL notice: ${notice.message}`);
  },
});

logger.info('Initializing PostgreSQL database connection');

export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === 'development',
});

export const verifyConnection = async () => {
  try {
    await client`SELECT 1`;
    logger.info('Database connection verified successfully');
  } catch (error) {
    logger.error({ error }, 'Database connection failed');
    throw error;
  }
};

export type DrizzleDB = typeof db;
