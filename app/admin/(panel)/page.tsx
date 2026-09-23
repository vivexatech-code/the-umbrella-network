import { databaseMode } from "@/lib/db";
import { getDashboard } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboard();
  const cards = [
    ["Total students", stats.totalStudents],
    ["Paid registrations", stats.paidRegistrations],
    ["Pending payments", stats.pendingPayments],
    ["Failed payments", stats.failedPayments],
    ["Active batches", stats.activeBatches],
    ["Expired batches", stats.expiredBatches],
    ["Revenue", `₹${stats.revenue.toLocaleString("en-IN")}`],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Dashboard</h1>
        <p className="text-sm text-slate-500">Database: {databaseMode() === "supabase" ? "Supabase" : "Local file store"}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(([label, value]) => (
          <div key={String(label)} className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="text-[11px] uppercase tracking-wide font-bold text-slate-500">{label}</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{value}</div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto">
        <div className="px-4 py-3 font-bold border-b border-slate-100">Recent registrations</div>
        <table className="w-full text-sm">
          <tbody>
            {stats.recentRegistrations.length === 0 && (
              <tr><td className="px-4 py-6 text-slate-500">No registrations yet.</td></tr>
            )}
            {stats.recentRegistrations.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-semibold">{item.full_name}</td>
                <td className="px-4 py-3">{item.batch_number}</td>
                <td className="px-4 py-3 capitalize">{item.payment_status}</td>
                <td className="px-4 py-3">₹{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
