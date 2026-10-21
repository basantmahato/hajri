import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { phoneNumber } from 'better-auth/plugins';
import { db } from './database.js';
import { sendMsg91Otp, verifyMsg91Otp } from '../services/msg91-otp.js';
import {
  authAccounts,
  authSessions,
  authUsers,
  authVerifications,
} from '../models/auth.schema.js';

const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
};

const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:3001';
const authSecret = requiredEnv('BETTER_AUTH_SECRET');

if (authSecret.length < 32) {
  throw new Error('BETTER_AUTH_SECRET must be at least 32 characters long');
}

export const auth = betterAuth({
  appName: 'Hajri',
  baseURL: requiredEnv('BETTER_AUTH_URL'),
  secret: authSecret,
  trustedOrigins: [frontendOrigin],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: authUsers,
      session: authSessions,
      account: authAccounts,
      verification: authVerifications,
    },
  }),
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    google: {
      clientId: requiredEnv('GOOGLE_CLIENT_ID'),
      clientSecret: requiredEnv('GOOGLE_CLIENT_SECRET'),
    },
  },
  plugins: [
    phoneNumber({
      otpLength: 6,
      expiresIn: 300,
      allowedAttempts: 3,
      phoneNumberValidator: (value) => /^\+[1-9]\d{7,14}$/.test(value),
      sendOTP: ({ phoneNumber: value }) => sendMsg91Otp(value),
      verifyOTP: ({ phoneNumber: value, code }) => verifyMsg91Otp(value, code),
      signUpOnVerification: {
        getTempEmail: (value) =>
          `phone-${value.replace(/\D/g, '')}@phone.hajri.app`,
        getTempName: (value) => `Hajri user ${value.slice(-4)}`,
      },
    }),
  ],
  advanced: {
    ipAddress: {
      ipAddressHeaders: ['x-real-ip'],
    },
  },
  rateLimit: {
    enabled: true,
  },
});
