import { requireAdmin } from "@/lib/auth/guard";
import { getStore } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { fulfillRegistration } from "@/lib/payments/fulfill";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;
  const store = await getStore();
  const existing = await store.getRegistration(id);
  if (!existing) return jsonError("Registration not found.", 404);
  if (existing.payment_status !== "paid") return jsonError("Only paid registrations can be retried.", 400);
  const registration = await fulfillRegistration(existing.id);
  return jsonOk({ registration });
}
