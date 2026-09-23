import { sessionCookieOptions } from "@/lib/auth/session";
import { jsonOk } from "@/lib/http";

export async function POST(request: Request) {
  const response = jsonOk({ loggedOut: true });
  response.cookies.set("un_admin", "", { ...sessionCookieOptions(request), maxAge: 0 });
  return response;
}
