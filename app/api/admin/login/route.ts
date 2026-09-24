import { ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE, adminConfigured, sessionCookieOptions, signInAdmin } from "@/lib/auth/session";
import { clientIp, jsonError, jsonOk } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!rateLimit(`admin-login:${clientIp(request)}`, 8, 15 * 60 * 1000)) {
    return jsonError("Too many login attempts. Please wait and try again.", 429);
  }
  if (!adminConfigured()) return jsonError("Admin login is not configured.", 503);
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  if (!body?.email || !body.password) return jsonError("Enter your email and password.", 400);

  const result = await signInAdmin(body.email, body.password);
  if (!result.ok) return jsonError(result.error, 401);

  const response = jsonOk({ admin: { id: result.user.id, email: result.user.email } });
  const accessOptions = sessionCookieOptions(request, result.session.expires_in || 60 * 60);
  response.cookies.set(ADMIN_ACCESS_COOKIE, result.session.access_token, accessOptions);
  response.cookies.set(ADMIN_REFRESH_COOKIE, result.session.refresh_token, {
    ...accessOptions,
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set("un_admin", "", { ...accessOptions, maxAge: 0 });
  return response;
}
