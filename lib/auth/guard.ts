import "server-only";

import { getSession } from "@/lib/auth/session";
import { jsonError } from "@/lib/http";

export async function requireAdmin() {
  const session = await getSession();
  if (!session) return { session: null, response: jsonError("Unauthorized.", 401) };
  return { session, response: null };
}
