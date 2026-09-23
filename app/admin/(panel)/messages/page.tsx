import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const store = await getStore();
  const messages = await store.listContacts();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Messages</h1>
      {messages.length === 0 && <p className="text-sm text-slate-500">No contact messages yet.</p>}
      {messages.map((message) => (
        <article key={message.id} className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="font-bold">{message.name}</div>
          <div className="text-xs text-slate-500">{message.email} {message.phone ? `· ${message.phone}` : ""}</div>
          <p className="text-sm text-slate-700 mt-2 whitespace-pre-line">{message.message}</p>
        </article>
      ))}
    </div>
  );
}
