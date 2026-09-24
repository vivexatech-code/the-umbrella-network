import "server-only";

import fs from "fs";
import path from "path";
import { google } from "googleapis";

type ServiceAccount = {
  client_email: string;
  private_key: string;
};

function accountFromJson(value: string): ServiceAccount | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const raw = JSON.parse(trimmed) as Record<string, string>;
    const clientEmail = raw.client_email || raw.clientEmail || "";
    const privateKey = String(raw.private_key || raw.privateKey || "").replace(/\\n/g, "\n");
    if (!clientEmail || !privateKey.includes("BEGIN")) return null;
    return { client_email: clientEmail, private_key: privateKey };
  } catch {
    return null;
  }
}

function accountFromEnvValue(value: string): ServiceAccount | null {
  const direct = accountFromJson(value);
  if (direct) return direct;
  try {
    const decoded = Buffer.from(value.trim(), "base64").toString("utf8");
    return accountFromJson(decoded);
  } catch {
    return null;
  }
}

function accountFromEnvFile(): ServiceAccount | null {
  try {
    const file = path.join(process.cwd(), ".env");
    if (!fs.existsSync(file)) return null;
    const line = fs
      .readFileSync(file, "utf8")
      .split(/\r?\n/)
      .find((entry) => entry.startsWith("GOOGLE_SERVICE_ACCOUNT_JSON=") || entry.startsWith("GOOGLE_SERVICE_ACCOUNT_JSON_BASE64="));
    if (!line) return null;
    if (line.startsWith("GOOGLE_SERVICE_ACCOUNT_JSON_BASE64=")) {
      return accountFromEnvValue(line.slice("GOOGLE_SERVICE_ACCOUNT_JSON_BASE64=".length).trim());
    }
    const start = line.indexOf("{");
    const end = line.lastIndexOf("}");
    if (start === -1 || end <= start) return null;
    return accountFromJson(line.slice(start, end + 1));
  } catch {
    return null;
  }
}

export function googleCredentials(): ServiceAccount | null {
  const encoded = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;
  if (encoded) {
    const parsed = accountFromEnvValue(encoded);
    if (parsed) return parsed;
  }
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (raw) {
    const parsed = accountFromEnvValue(raw);
    if (parsed) return parsed;
  }
  return accountFromEnvFile();
}

export function googleAuth(scopes: string[]) {
  const credentials = googleCredentials();
  if (!credentials) return null;
  return new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes,
  });
}

export function googleClientEmail() {
  return googleCredentials()?.client_email || "";
}
