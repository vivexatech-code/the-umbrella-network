import { jsonError, jsonOk } from "@/lib/http";
import { retryPendingFulfillment } from "@/lib/payments/fulfill";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") || "";
  if (!secret || header !== `Bearer ${secret}`) return jsonError("Unauthorized.", 401);
  const processed = await retryPendingFulfillment();
  return jsonOk({ processed });
}
