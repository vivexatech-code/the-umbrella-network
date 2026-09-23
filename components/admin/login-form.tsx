'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        const form = new FormData(event.currentTarget);
        const response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: form.get('username'), password: form.get('password') }),
        });
        const data = (await response.json()) as { error?: string };
        setLoading(false);
        if (!response.ok) {
          setError(data.error || 'Login failed.');
          return;
        }
        router.replace('/admin');
        router.refresh();
      }}
    >
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Admin login</h1>
        <p className="text-sm text-slate-500 mt-1">The Umbrella Network masterclass console</p>
      </div>
      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
      <label className="block text-xs font-bold text-slate-700">Username
        <input name="username" required autoComplete="username" className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2.5 text-base" />
      </label>
      <label className="block text-xs font-bold text-slate-700">Password
        <input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2.5 text-base" />
      </label>
      <button disabled={loading} className="w-full bg-blue-600 text-white font-bold rounded-xl py-3 disabled:opacity-60">
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
