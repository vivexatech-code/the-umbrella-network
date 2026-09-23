import { requireAdmin } from "@/lib/auth/guard";
import { getStore } from "@/lib/db";
import { jsonOk } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const url = new URL(request.url);
  const search = (url.searchParams.get("q") || "").toLowerCase();
  const batchId = url.searchParams.get("batch") || "";
  const status = url.searchParams.get("status") || "";
  const store = await getStore();
  let registrations = await store.listRegistrations();
  if (search) {
    registrations = registrations.filter((item) =>
      [item.full_name, item.email, item.whatsapp_number, item.registration_number, item.razorpay_payment_id]
        .join(" ")
        .toLowerCase()
        .includes(search),
    );
  }
  if (batchId) registrations = registrations.filter((item) => item.batch_id === batchId);
  if (status) registrations = registrations.filter((item) => item.payment_status === status);
  return jsonOk({ registrations });
}
