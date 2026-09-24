import "server-only";

import { createClient, type Session, type User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const ADMIN_ACCESS_COOKIE = "sb-admin-access";
export const ADMIN_REFRESH_COOKIE = "sb-admin-refresh";

export const ADMIN_USER_ID = process.env.ADMIN_USER_ID || "0e7b55a7-83a2-410a-8849-e667a13395cc";
export const ADMIN_EMAIL = (process.env.ADMIN_USER_EMAIL || "admin@vivexatech.in").toLowerCase();

export type AdminSession = {
  id: string;
  email: string;
  username: string;
};

function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
}

function supabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
}

export function adminConfigured() {
  return Boolean(supabaseUrl() && supabaseAnonKey());
}

function authClient() {
  return createClient(supabaseUrl(), supabaseAnonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isAdminUser(user: Pick<User, "id" | "email"> | null | undefined) {
  if (!user?.email) return false;
  return user.id === ADMIN_USER_ID && user.email.toLowerCase() === ADMIN_EMAIL;
}

export function sessionCookieOptions(request?: Request, maxAge = 60 * 60 * 24 * 7) {
  const forwarded = request?.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const secure = forwarded ? forwarded === "https" : request ? new URL(request.url).protocol === "https:" : false;
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge,
  };
}

export async function signInAdmin(email: string, password: string) {
  const supabase = authClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error || !data.session || !data.user) {
    return { ok: false as const, error: "Invalid email or password." };
  }
  if (!isAdminUser(data.user)) {
    return { ok: false as const, error: "This account is not allowed to access the admin panel." };
  }
  return { ok: true as const, session: data.session, user: data.user };
}

function toAdminSession(user: User): AdminSession {
  const email = user.email || ADMIN_EMAIL;
  return { id: user.id, email, username: email };
}

async function persistRefreshedSession(session: Session) {
  const jar = await cookies();
  const options = sessionCookieOptions(undefined, session.expires_in || 60 * 60);
  jar.set(ADMIN_ACCESS_COOKIE, session.access_token, options);
  jar.set(ADMIN_REFRESH_COOKIE, session.refresh_token, { ...options, maxAge: 60 * 60 * 24 * 7 });
}

export async function getSession(): Promise<AdminSession | null> {
  if (!adminConfigured()) return null;
  const jar = await cookies();
  const accessToken = jar.get(ADMIN_ACCESS_COOKIE)?.value;
  const refreshToken = jar.get(ADMIN_REFRESH_COOKIE)?.value;
  if (!accessToken && !refreshToken) return null;

  const supabase = authClient();
  if (accessToken) {
    const { data } = await supabase.auth.getUser(accessToken);
    const user = data.user;
    if (user && isAdminUser(user)) return toAdminSession(user);
  }

  if (!refreshToken) return null;
  const refreshed = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  const refreshedUser = refreshed.data.user;
  if (!refreshed.data.session || !refreshedUser || !isAdminUser(refreshedUser)) return null;
  try {
    await persistRefreshedSession(refreshed.data.session);
  } catch {
    // Cookie updates are not always allowed during a server render. The refreshed user is still valid for this request.
  }
  return toAdminSession(refreshedUser);
}
