'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { siteConfig } from '@/lib/config';
import { useRegistration } from '@/components/site/registration-context';

export function JoinPopup() {
  const { isRegistrationOpen, isRazorpayOpen, successData, openRegistration, activeBatch } = useRegistration();
  const [visible, setVisible] = useState(false);
  const blocked = isRegistrationOpen || isRazorpayOpen || Boolean(successData);

  useEffect(() => {
    if (blocked || visible) return;
    const timer = window.setTimeout(() => setVisible(true), siteConfig.joinPopupIntervalMs);
    return () => window.clearTimeout(timer);
  }, [blocked, visible]);

  useEffect(() => {
    if (blocked && visible) setVisible(false);
  }, [blocked, visible]);

  if (!visible || blocked) return null;
  const fee = activeBatch?.fee || 999;

  return (
    <div className="fixed z-40 bottom-24 right-3 left-3 sm:left-auto sm:max-w-sm animate-in fade-in slide-in-from-bottom-2">
      <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl p-5 relative">
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="absolute top-3 right-3 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold uppercase tracking-wider mb-3">
          <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
          Next batch enrolling
        </div>
        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight pr-6">Join the Articleship Masterclass</h3>
        <p className="text-sm text-slate-600 mt-1">A practical 6-day cohort with CV, interview and application strategy. ₹{fee} only.</p>
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            openRegistration(activeBatch || undefined);
          }}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl"
        >
          <span>Join Masterclass – ₹{fee}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
