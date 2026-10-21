import { createAuthClient } from "better-auth/react";
import { phoneNumberClient } from "better-auth/client/plugins";

const authServerUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: authServerUrl,
  plugins: [phoneNumberClient()],
});
