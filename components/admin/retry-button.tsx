'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type RetryTarget = 'all' | 'drive' | 'sheets';

export function RetryButton({
  id,
  target = 'all',
  label,
}: {
  id: string;
  target?: RetryTarget;
  label?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const text = label || (target === 'drive' ? 'Retry Drive' : target === 'sheets' ? 'Retry Sheet' : 'Retry failed steps');

  return (
    <div>
      <button
        type="button"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          setMessage(null);
          const response = await fetch(`/api/admin/registrations/${id}/retry`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target }),
          });
          const data = (await response.json()) as { error?: string; message?: string };
          setLoading(false);
          setMessage(data.error || data.message || 'Retry finished.');
          if (response.ok) router.refresh();
        }}
        className="bg-white border border-slate-300 hover:border-blue-400 text-slate-800 font-bold text-xs px-3 py-1.5 rounded-lg disabled:opacity-60"
      >
        {loading ? 'Retrying...' : text}
      </button>
      {message && <p className="text-[11px] text-slate-600 mt-1 max-w-xs">{message}</p>}
    </div>
  );
}
