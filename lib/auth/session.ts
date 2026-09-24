import "server-only";

import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "un_admin";

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_TOKEN || "";
}

function adminPassword() {
  return process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD_HASH || "";
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_USERNAME && adminPassword() && secret());
}

export function verifyAdminCredentials(username: string, password: string) {
  if (!adminConfigured()) return false;
  return safeEqual(username, process.env.ADMIN_USERNAME || "") && safeEqual(password, adminPassword());
}

export function signSession(username: string) {
  const payload = Buffer.from(JSON.stringify({ u: username, exp: Date.now() + 12 * 60 * 60 * 1000 })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function readSessionToken(token?: string | null): { username: string } | null {
  if (!token || !secret()) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  if (!safeEqual(signature, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { u?: string; exp?: number };
    if (!data.u || !data.exp || data.exp < Date.now()) return null;
    return { username: data.u };
  } catch {
    return null;
  }
}

export async function getSession() {
  const jar = await cookies();
  return readSessionToken(jar.get(ADMIN_COOKIE)?.value);
}

export function sessionCookieOptions(request?: Request) {
  const forwarded = request?.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const secure = forwarded ? forwarded === "https" : request ? new URL(request.url).protocol === "https:" : false;
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: 12 * 60 * 60,
  };
}
