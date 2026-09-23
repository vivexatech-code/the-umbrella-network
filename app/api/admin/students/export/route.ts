import { requireAdmin } from "@/lib/auth/guard";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const store = await getStore();
  const registrations = await store.listRegistrations();
  const header = [
    "Registration ID",
    "Name",
    "Email",
    "WhatsApp",
    "Qualification",
    "Attempt",
    "Batch",
    "Amount",
    "Payment status",
    "Razorpay payment ID",
    "Invoice ID",
    "Drive access",
    "Sheet sync",
    "Created",
  ];
  const lines = registrations.map((item) =>
    [
      item.registration_number,
      item.full_name,
      item.email,
      item.whatsapp_number,
      item.qualification_level,
      item.attempt_details,
      item.batch_number,
      String(item.amount),
      item.payment_status,
      item.razorpay_payment_id,
      item.invoice_id,
      item.drive_access_status,
      item.sheets_sync_status,
      item.created_at,
    ]
      .map((value) => `"${value.replaceAll('"', '""')}"`)
      .join(","),
  );
  return new Response([header.join(","), ...lines].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=umbrella-registrations.csv",
    },
  });
}
