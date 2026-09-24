import { requireAdmin } from "@/lib/auth/guard";
import { getStore } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { fulfillRegistration, retryDriveAccess, retrySheetSync } from "@/lib/payments/fulfill";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;
  const store = await getStore();
  const existing = await store.getRegistration(id);
  if (!existing) return jsonError("Registration not found.", 404);
  if (existing.payment_status !== "paid") return jsonError("Only paid registrations can be retried.", 400);

  const body = (await request.json().catch(() => ({}))) as { target?: string };
  const target = body.target === "drive" || body.target === "sheets" ? body.target : "all";
  const registration =
    target === "drive"
      ? await retryDriveAccess(existing.id)
      : target === "sheets"
        ? await retrySheetSync(existing.id)
        : await fulfillRegistration(existing.id);

  if (!registration) return jsonError("Retry could not be completed.", 400);
  const failed =
    target === "drive"
      ? registration.drive_access_status === "failed"
      : target === "sheets"
        ? registration.sheets_sync_status === "failed"
        : false;
  const detail =
    target === "drive" ? registration.drive_access_error : target === "sheets" ? registration.sheets_sync_error : "";

  return jsonOk({
    registration,
    message: failed ? detail || "Retry failed." : target === "drive" ? "Drive access granted." : target === "sheets" ? "Student added to the Google Sheet." : "Failed steps were retried.",
  });
}
