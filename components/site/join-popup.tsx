'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, X, Sparkles } from 'lucide-react';
import { siteConfig } from '@/lib/config';
import { useRegistration } from '@/components/site/registration-context';

export function JoinPopup() {
  const {
    isRegistrationOpen,
    isRazorpayOpen,
    successData,
    openRegistration,
    activeBatch,
  } = useRegistration();

  const [visible, setVisible] = useState(false);

  const blocked =
    isRegistrationOpen || isRazorpayOpen || Boolean(successData);

  useEffect(() => {
    if (blocked || visible) return;

    const timer = window.setTimeout(
      () => setVisible(true),
      siteConfig.joinPopupIntervalMs
    );

    return () => window.clearTimeout(timer);
  }, [blocked, visible]);

  useEffect(() => {
    if (blocked && visible) {
      setVisible(false);
    }
  }, [blocked, visible]);

  if (!visible || blocked) return null;

  const fee = activeBatch?.fee || 999;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[3px] animate-in fade-in duration-300"
        onClick={() => setVisible(false)}
      />

      {/* Popup */}
      <div className="relative w-full max-w-lg animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-300">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.25)]">
          
          {/* Top gradient */}
          <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600" />

          {/* Close button */}
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-7 sm:p-9">
            {/* Badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-700">
              <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
              Next Batch Enrolling
            </div>

            {/* Icon */}
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
              <Sparkles className="h-7 w-7" />
            </div>

            {/* Heading */}
            <h3 className="pr-8 text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl">
              Join the Articleship Masterclass
            </h3>

            {/* Description */}
            <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">
              A practical 6-day cohort designed to help you with your
              <span className="font-semibold text-slate-800">
                {' '}CV, interviews, applications
              </span>{' '}
              and overall articleship strategy.
            </p>

            {/* Price */}
            <div className="mt-6 flex items-end gap-3">
              <span className="text-3xl font-extrabold text-blue-600 sm:text-4xl">
                ₹{fee}
              </span>

              <span className="mb-1 text-lg font-semibold text-slate-400 line-through">
                ₹1999
              </span>

              <span className="mb-1 rounded-lg bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                Limited Offer
              </span>
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={() => {
                setVisible(false);
                openRegistration(activeBatch || undefined);
              }}
              className="group mt-7 flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.98] sm:py-5 sm:text-lg"
            >
              <span>Join Masterclass – ₹{fee}</span>

              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            {/* Bottom note */}
            <p className="mt-4 text-center text-xs text-slate-400">
              Seats are limited for the upcoming cohort.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}