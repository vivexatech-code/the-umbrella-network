import Link from "next/link";
import { notFound } from "next/navigation";
import { RetryButton } from "@/components/admin/retry-button";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await getStore();
  const registration = await store.getRegistration(id);
  if (!registration) notFound();
  const rows: [string, string][] = [
    ["Registration", registration.registration_number],
    ["Invoice", registration.invoice_id || "—"],
    ["Name", registration.full_name],
    ["Email", registration.email],
    ["WhatsApp", registration.whatsapp_number],
    ["Qualification", registration.qualification_level],
    ["Attempt details", registration.attempt_details || "—"],
    ["Batch", `${registration.batch_number} · ${registration.batch_name}`],
    ["Dates", registration.batch_date],
    ["Amount", `₹${registration.amount} ${registration.currency}`],
    ["Payment status", registration.payment_status],
    ["Webhook confirmed", registration.webhook_confirmed ? "Yes" : "No"],
    ["Razorpay order", registration.razorpay_order_id || "—"],
    ["Razorpay payment", registration.razorpay_payment_id || "—"],
    ["Access email", statusLine(registration.access_email_status, registration.access_email_error)],
    ["Invoice email", statusLine(registration.invoice_email_status, registration.invoice_email_error)],
    ["Drive access", statusLine(registration.drive_access_status, registration.drive_access_error)],
    ["Google Sheet", statusLine(registration.sheets_sync_status, registration.sheets_sync_error)],
    ["Paid at", registration.paid_at || "—"],
    ["Created", registration.created_at],
  ];

  return (
    <div className="space-y-4">
      <Link href="/admin/students" className="text-sm font-semibold text-blue-700">Back to students</Link>
      <h1 className="text-2xl font-extrabold">{registration.full_name}</h1>
      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
        {rows.map(([label, value]) => (
          <div key={label} className="px-4 py-3 grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 text-sm">
            <div className="font-bold text-slate-500">{label}</div>
            <div className="break-words">{value}</div>
          </div>
        ))}
      </div>
      {registration.payment_status === "paid" && (
        <div className="flex flex-wrap gap-3">
          <RetryButton id={registration.id} target="drive" label="Retry Drive access" />
          <RetryButton id={registration.id} target="sheets" label="Retry Google Sheet" />
          <RetryButton id={registration.id} label="Retry all failed steps" />
        </div>
      )}
    </div>
  );
}

function statusLine(status: string, error: string) {
  return error ? `${status} — ${error}` : status;
}
