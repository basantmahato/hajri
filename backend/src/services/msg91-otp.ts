import { z } from 'zod';

type Msg91Response = {
  type?: string;
  message?: string;
};

const msg91ResponseSchema = z.object({
  type: z.string().optional(),
  message: z.string().optional(),
});

const MSG91_OTP_URL = 'https://control.msg91.com/api/v5/otp';
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;

const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required for phone sign-in`);
  }
  return value;
};

const readResponse = async (response: Response): Promise<Msg91Response> => {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`MSG91 returned an invalid response (HTTP ${response.status})`);
  }

  const result = msg91ResponseSchema.safeParse(payload);
  if (!result.success) {
    throw new Error(`MSG91 returned an invalid response (HTTP ${response.status})`);
  }
  return result.data;
};

const getMobile = (phoneNumber: string): string => {
  if (!/^\+[1-9]\d{7,14}$/.test(phoneNumber)) {
    throw new Error('Phone number must be in international E.164 format');
  }
  return phoneNumber.slice(1);
};

export const sendMsg91Otp = async (phoneNumber: string): Promise<void> => {
  const authKey = requiredEnv('MSG91_AUTH_KEY');
  const templateId = requiredEnv('MSG91_OTP_TEMPLATE_ID');
  const url = new URL(MSG91_OTP_URL);
  url.searchParams.set('template_id', templateId);
  url.searchParams.set('mobile', getMobile(phoneNumber));
  url.searchParams.set('otp_length', String(OTP_LENGTH));
  url.searchParams.set('otp_expiry', String(OTP_EXPIRY_MINUTES));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      authkey: authKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({}),
  });
  const result = await readResponse(response);

  if (!response.ok || result.type !== 'success') {
    throw new Error(`MSG91 could not send the OTP (HTTP ${response.status})`);
  }
};

export const verifyMsg91Otp = async (
  phoneNumber: string,
  code: string,
): Promise<boolean> => {
  const authKey = requiredEnv('MSG91_AUTH_KEY');
  const url = new URL(`${MSG91_OTP_URL}/verify`);
  url.searchParams.set('mobile', getMobile(phoneNumber));
  url.searchParams.set('otp', code);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authkey: authKey,
    },
  });
  const result = await readResponse(response);

  if (response.ok && result.type === 'success') {
    return true;
  }

  if (
    result.type === 'error' &&
    /(?:invalid|incorrect|expired|mismatch|not match).*otp|otp.*(?:invalid|incorrect|expired|mismatch|not match)/i.test(
      result.message ?? '',
    )
  ) {
    return false;
  }

  throw new Error(`MSG91 could not verify the OTP (HTTP ${response.status})`);
};
