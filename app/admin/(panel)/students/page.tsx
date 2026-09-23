import Link from "next/link";
import { getStore } from "@/lib/db";
import type { PaymentStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; batch?: string; status?: string }>;
}) {
  const query = await searchParams;
  const store = await getStore();
  const [registrations, batches] = await Promise.all([store.listRegistrations(), store.listAllBatches()]);
  const q = (query.q || "").toLowerCase();
  const filtered = registrations.filter((item) => {
    const matchesQuery = !q || [item.full_name, item.email, item.whatsapp_number, item.registration_number, item.razorpay_payment_id].join(" ").toLowerCase().includes(q);
    const matchesBatch = !query.batch || item.batch_id === query.batch;
    const matchesStatus = !query.status || item.payment_status === query.status;
    return matchesQuery && matchesBatch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Students</h1>
        <a href="/api/admin/students/export" className="text-sm font-bold text-blue-700">Export CSV</a>
      </div>
      <form className="bg-white border border-slate-200 rounded-2xl p-3 grid grid-cols-1 sm:grid-cols-4 gap-2">
        <input name="q" defaultValue={query.q || ""} placeholder="Search name, email, phone" className="border border-slate-300 rounded-xl px-3 py-2 text-sm sm:col-span-2" />
        <select name="batch" defaultValue={query.batch || ""} className="border border-slate-300 rounded-xl px-3 py-2 text-sm">
          <option value="">All batches</option>
          {batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.batch_number}</option>)}
        </select>
        <select name="status" defaultValue={query.status || ""} className="border border-slate-300 rounded-xl px-3 py-2 text-sm">
          <option value="">All payments</option>
          {(["paid", "pending", "failed", "cancelled", "refunded"] as PaymentStatus[]).map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <button className="sm:col-span-4 bg-slate-900 text-white font-bold rounded-xl py-2.5 text-sm">Apply filters</button>
      </form>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Batch</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Drive</th>
              <th className="px-4 py-3">Sheet</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <Link href={`/admin/students/${item.id}`} className="font-bold text-blue-800">{item.full_name}</Link>
                  <div className="text-xs text-slate-500">{item.email}</div>
                </td>
                <td className="px-4 py-3">{item.batch_number}</td>
                <td className="px-4 py-3 capitalize">{item.payment_status}</td>
                <td className="px-4 py-3">{item.drive_access_status}</td>
                <td className="px-4 py-3">{item.sheets_sync_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="px-4 py-6 text-sm text-slate-500">No students match these filters.</p>}
      </div>
    </div>
  );
}
