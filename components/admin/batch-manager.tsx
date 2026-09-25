'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminBatchLabel } from '@/lib/batches/availability';
import { toDatetimeLocal } from '@/lib/content/format';
import type { Batch } from '@/lib/types';

const empty = {
  batch_number: '',
  name: '',
  start_at: '',
  end_at: '',
  registration_deadline_at: '',
  fee: 999,
  whatsapp_link: '',
  drive_folder_url: '',
  session_info: 'Live sessions run across six days. Daily Google Meet links are shared in the batch WhatsApp group.',
  max_seats: 100,
  status: 'upcoming' as Batch['status'],
  description: '',
};

export function BatchManager({ batches }: { batches: Batch[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState<string | null>(null);

  async function remove(batch: Batch) {
    const confirmed = window.confirm(`Delete ${batch.batch_number}? Paid student records for this batch are kept, and a batch with paid students cannot be deleted.`);
    if (!confirmed) return;
    const response = await fetch(`/api/admin/batches/${batch.id}`, { method: 'DELETE' });
    const data = (await response.json()) as { error?: string };
    setMessage(data.error || `${batch.batch_number} deleted.`);
    if (response.ok) {
      if (editing === batch.id) load();
      router.refresh();
    }
  }

  function load(batch?: Batch) {
    if (!batch) {
      setEditing(null);
      setForm(empty);
      return;
    }
    setEditing(batch.id);
    setForm({
      batch_number: batch.batch_number,
      name: batch.name,
      start_at: toDatetimeLocal(batch.start_at),
      end_at: toDatetimeLocal(batch.end_at),
      registration_deadline_at: toDatetimeLocal(batch.registration_deadline_at),
      fee: batch.fee,
      whatsapp_link: batch.whatsapp_link,
      drive_folder_url: batch.drive_folder_url,
      session_info: batch.session_info.replace(/Zoom/g, 'Google Meet'),
      max_seats: batch.max_seats,
      status: batch.status,
      description: batch.description,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Batches</h1>
        <button type="button" onClick={() => load()} className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl">New batch</button>
      </div>
      {message && <p className="text-sm bg-slate-900 text-white rounded-xl px-3 py-2">{message}</p>}
      <form
        className="bg-white border border-slate-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          const response = await fetch(editing ? `/api/admin/batches/${editing}` : '/api/admin/batches', {
            method: editing ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
          });
          const data = (await response.json()) as { error?: string };
          setMessage(data.error || (editing ? 'Batch updated.' : 'Batch created.'));
          if (response.ok) {
            load();
            router.refresh();
          }
        }}
      >
        <Field label="Batch title" value={form.batch_number} onChange={(value) => setForm({ ...form, batch_number: value })} />
        <Field label="Batch name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
        <Field label="Start" type="datetime-local" value={form.start_at} onChange={(value) => setForm({ ...form, start_at: value })} />
        <Field label="End" type="datetime-local" value={form.end_at} onChange={(value) => setForm({ ...form, end_at: value })} />
        <Field label="Registration deadline" type="datetime-local" value={form.registration_deadline_at} onChange={(value) => setForm({ ...form, registration_deadline_at: value })} />
        <Field label="Fee (INR)" type="number" value={String(form.fee)} onChange={(value) => setForm({ ...form, fee: Number(value) })} />
        <Field label="WhatsApp group link" value={form.whatsapp_link} onChange={(value) => setForm({ ...form, whatsapp_link: value })} />
        <Field label="Google Drive folder URL" value={form.drive_folder_url} onChange={(value) => setForm({ ...form, drive_folder_url: value })} />
        <label className="text-xs font-bold text-slate-700">Status
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Batch['status'] })} className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 text-sm">
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <Field label="Max seats" type="number" value={String(form.max_seats)} onChange={(value) => setForm({ ...form, max_seats: Number(value) })} />
        <label className="text-xs font-bold text-slate-700 sm:col-span-2">Session / access information
          <textarea value={form.session_info} onChange={(event) => setForm({ ...form, session_info: event.target.value })} className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 text-sm min-h-20" />
        </label>
        <label className="text-xs font-bold text-slate-700 sm:col-span-2">Description
          <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 text-sm min-h-16" />
        </label>
        <button className="sm:col-span-2 bg-slate-900 text-white font-bold rounded-xl py-3">{editing ? 'Save batch' : 'Create batch'}</button>
      </form>

      <div className="space-y-3">
        {batches.map((batch) => (
          <div key={batch.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold">{batch.batch_number} · {batch.name}</div>
              <div className="text-xs text-slate-500 mt-1">{batch.start_date} – {batch.end_date} · Deadline {batch.registration_deadline}</div>
              <div className="text-xs font-semibold text-blue-700 mt-1">{adminBatchLabel(batch)} · {batch.seats_booked}/{batch.max_seats} seats · ₹{batch.fee}</div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => load(batch)} className="text-sm font-bold border border-slate-300 rounded-xl px-3 py-2">Edit</button>
              <button type="button" onClick={() => void remove(batch)} className="text-sm font-bold border border-red-200 text-red-700 rounded-xl px-3 py-2 hover:bg-red-50">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="text-xs font-bold text-slate-700">{label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-medium" />
    </label>
  );
}
