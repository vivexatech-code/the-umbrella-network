import { getStore } from "@/lib/db";
import { clientIp, jsonError, jsonOk } from "@/lib/http";
import { toSuccessResponse } from "@/lib/payments/confirm";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!rateLimit(`status:${clientIp(request)}`, 30, 10 * 60 * 1000)) {
    return jsonError("Too many status checks. Please wait a moment.", 429);
  }
  const query = new URL(request.url).searchParams.get("query")?.trim() || "";
  if (!query || query.length > 80) return jsonError("A registration reference is required.");
  const store = await getStore();
  const registration = await store.getRegistration(query);
  if (!registration) return jsonError("No registration was found for that reference.", 404);
  const batch = await store.getBatch(registration.batch_id);
  return jsonOk({
    registration: toSuccessResponse(registration, {
      whatsapp: batch?.whatsapp_link,
      drive: batch?.drive_folder_url,
    }),
  });
}
