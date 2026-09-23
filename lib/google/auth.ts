import "server-only";

import { google } from "googleapis";

export function googleCredentials() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) return null;
  const raw = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON) as Record<string, string>;
  return {
    client_email: raw.client_email || raw.clientEmail,
    private_key: String(raw.private_key || raw.privateKey || "").replace(/\\n/g, "\n"),
  };
}

export function googleAuth(scopes: string[]) {
  const credentials = googleCredentials();
  if (!credentials?.client_email || !credentials.private_key) return null;
  return new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes,
  });
}
