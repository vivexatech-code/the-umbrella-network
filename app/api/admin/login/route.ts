import { adminConfigured, sessionCookieOptions, signSession, verifyAdminCredentials } from "@/lib/auth/session";
import { clientIp, jsonError, jsonOk } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!rateLimit(`admin-login:${clientIp(request)}`, 8, 15 * 60 * 1000)) {
    return jsonError("Too many login attempts. Please wait and try again.", 429);
  }
  if (!adminConfigured()) return jsonError("Admin login is not configured.", 503);
  const body = (await request.json().catch(() => null)) as { username?: string; password?: string } | null;
  if (!body?.username || !body.password || !verifyAdminCredentials(body.username, body.password)) {
    return jsonError("Invalid admin credentials.", 401);
  }
  const response = jsonOk({ admin: { username: body.username } });
  response.cookies.set("un_admin", signSession(body.username), sessionCookieOptions(request));
  return response;
}
