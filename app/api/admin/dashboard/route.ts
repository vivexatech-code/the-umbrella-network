import { requireAdmin } from "@/lib/auth/guard";
import { jsonOk } from "@/lib/http";
import { getDashboard } from "@/lib/site-data";
import { databaseMode } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const overview = await getDashboard();
  return jsonOk({ overview, database: databaseMode() });
}
