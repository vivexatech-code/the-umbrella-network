'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function RetryButton({ id }: { id: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <button
        type="button"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          setMessage(null);
          const response = await fetch(`/api/admin/registrations/${id}/retry`, { method: 'POST' });
          const data = (await response.json()) as { error?: string };
          setLoading(false);
          setMessage(data.error || 'Access email, invoice, Drive and Sheets were retried.');
          if (response.ok) router.refresh();
        }}
        className="bg-blue-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl disabled:opacity-60"
      >
        {loading ? 'Retrying...' : 'Retry failed steps'}
      </button>
      {message && <p className="text-xs text-slate-600 mt-2">{message}</p>}
    </div>
  );
}
