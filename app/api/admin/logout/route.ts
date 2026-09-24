import { ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE, sessionCookieOptions } from "@/lib/auth/session";
import { jsonOk } from "@/lib/http";

export async function POST(request: Request) {
  const response = jsonOk({ loggedOut: true });
  const expired = { ...sessionCookieOptions(request), maxAge: 0 };
  response.cookies.set(ADMIN_ACCESS_COOKIE, "", expired);
  response.cookies.set(ADMIN_REFRESH_COOKIE, "", expired);
  response.cookies.set("un_admin", "", expired);
  return response;
}
