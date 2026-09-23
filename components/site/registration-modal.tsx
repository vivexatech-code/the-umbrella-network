'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, Lock, Mail, RefreshCw, Smartphone, User, X } from 'lucide-react';
import { useRegistration } from '@/components/site/registration-context';
import type { PaymentSuccessResponse } from '@/lib/types';

const LEVELS = [
  'CA Inter - Both Groups Cleared',
  'CA Inter - Group 1 Cleared',
  'CA Inter - Group 2 Cleared',
  'CA Inter - Appearing / Results Awaited',
  'Direct Entry Scheme Student',
  'Searching for Articleship Transfer',
];

interface CheckoutPayload {
  keyId: string;
  orderId: string;
  amount: number;
  amountInPaise: number;
  currency: 'INR';
  registrationId: string;
  batchName: string;
  batchNumber: string;
  devCheckout?: boolean;
  devToken?: string;
}

interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function RegistrationModal() {
  const {
    isRegistrationOpen,
    closeRegistration,
    batches,
    selectedBatch,
    setRazorpayOpen,
    setSuccessData,
  } = useRegistration();
  const [batchId, setBatchId] = useState(selectedBatch?.id || '');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [caLevel, setCaLevel] = useState(LEVELS[0]);
  const [attemptDetails, setAttemptDetails] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'processing' | 'failed' | 'devpay'>('form');
  const [devCheckout, setDevCheckout] = useState<CheckoutPayload | null>(null);
  const completed = useRef(false);
  const companyRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedBatch) setBatchId(selectedBatch.id);
  }, [selectedBatch]);

  useEffect(() => {
    if (!isRegistrationOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isRegistrationOpen]);

  if (!isRegistrationOpen) return null;
  const current = batches.find((batch) => batch.id === batchId) || selectedBatch;
  const fee = current?.fee || 999;

  const verifyPayment = async (checkout: CheckoutPayload, response: RazorpaySuccess) => {
    setStep('processing');
    const result = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registrationId: checkout.registrationId,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id || undefined,
        razorpay_signature: checkout.devCheckout ? undefined : response.razorpay_signature,
        devToken: checkout.devCheckout ? checkout.devToken : undefined,
      }),
    });
    const data = (await result.json()) as PaymentSuccessResponse & { error?: string };
    if (!result.ok || !data.success) {
      setErrorMsg(data.error || 'Payment could not be verified. If money was debited, refresh this page shortly or contact support.');
      setStep('failed');
      return;
    }
    closeRegistration();
    setSuccessData(data);
    setStep('form');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg(null);
    if (!batchId) {
      setErrorMsg('Please select a masterclass batch.');
      return;
    }
    setStep('processing');
    completed.current = false;
    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          caLevel,
          attemptDetails,
          batchId,
          company: companyRef.current?.value || '',
        }),
      });
      const data = (await response.json()) as { checkout?: CheckoutPayload; error?: string };
      if (!response.ok || !data.checkout) {
        setErrorMsg(data.error || 'Payment could not be started.');
        setStep('form');
        return;
      }
      if (data.checkout.devCheckout && data.checkout.devToken) {
        setDevCheckout(data.checkout);
        setStep('devpay');
        return;
      }
      const loaded = await loadRazorpay();
      if (!loaded || !window.Razorpay) {
        setErrorMsg('The payment window could not be opened. Please try again.');
        setStep('failed');
        return;
      }
      const checkout = data.checkout;
      setRazorpayOpen(true);
      const razorpay = new window.Razorpay({
        key: checkout.keyId,
        amount: checkout.amountInPaise,
        currency: checkout.currency,
        name: 'The Umbrella Network',
        description: `${checkout.batchNumber} · Articleship Masterclass`,
        order_id: checkout.orderId,
        prefill: { name: fullName, email, contact: phone },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: () => {
            setRazorpayOpen(false);
            if (!completed.current) {
              setErrorMsg('Payment was cancelled. You can try again when you are ready.');
              setStep('failed');
            }
          },
        },
        handler: (payment: RazorpaySuccess) => {
          completed.current = true;
          setRazorpayOpen(false);
          void verifyPayment(checkout, payment);
        },
      });
      setStep('form');
      razorpay.open();
    } catch {
      setRazorpayOpen(false);
      setErrorMsg('Network error. Please try again.');
      setStep('form');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white text-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-8 max-h-[calc(100vh-2rem)] overflow-y-auto">
        <button
          onClick={closeRegistration}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          aria-label="Close modal"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            <span>The Umbrella Network</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Reserve Your Articleship Seat</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            6-Day Articleship Masterclass • Direct cohort WhatsApp access upon registration
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input ref={companyRef} type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Masterclass Batch *</label>
              <select
                value={batchId}
                onChange={(event) => setBatchId(event.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm font-medium bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.batch_number} ({batch.name}) • Starts {batch.start_date} • ₹{batch.fee}
                  </option>
                ))}
              </select>
              {current && (
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between gap-3">
                  <span>Schedule: {current.start_date} - {current.end_date}</span>
                  <span className="font-semibold text-emerald-700">Fee: ₹{current.fee}</span>
                </div>
              )}
              {batches.length === 0 && (
                <p className="text-xs text-amber-700 mt-2">No batch is open for registration right now.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
              <div className="relative">
                <input required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="e.g. Yash Malhotra" className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address * (For Confirmation & Session Access)</label>
              <div className="relative">
                <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="yash@gmail.com" className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Used for registration confirmation, session access, WhatsApp group information, Google Drive access and your invoice.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">WhatsApp Mobile Number *</label>
              <div className="relative">
                <input required type="tel" inputMode="numeric" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="9876543210 (10 digits)" className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Used to invite you to your batch-specific WhatsApp community.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">CA Qualification Level *</label>
              <select value={caLevel} onChange={(event) => setCaLevel(event.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm font-medium bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden">
                {LEVELS.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Attempt / Relevant Details (Optional)</label>
              <input value={attemptDetails} onChange={(event) => setAttemptDetails(event.target.value)} placeholder="e.g. Cleared May 2026 attempt, targeting Big 4 Stat Audit" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
            </div>

            <div className="pt-3">
              <button type="submit" disabled={batches.length === 0} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-600/20 text-base transition-all cursor-pointer" id="modal-proceed-to-payment-btn">
                <span>Proceed to Pay ₹{fee}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-500">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Secure Razorpay checkout · ₹{fee} confirmed on the server</span>
              </div>
            </div>
          </form>
        )}

        {step === 'devpay' && devCheckout && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-1">Order summary</div>
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-900 text-sm">Articleship Masterclass ({devCheckout.batchNumber})</div>
                  <div className="text-xs text-slate-500">{fullName}</div>
                </div>
                <div className="text-2xl font-black text-blue-900">₹{devCheckout.amount}</div>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Razorpay keys are not set in this local environment, so checkout stays on this site. Add <span className="font-semibold">RAZORPAY_KEY_ID</span> and <span className="font-semibold">RAZORPAY_KEY_SECRET</span> to open the live Razorpay window. The amount is still taken from the server.
            </p>
            <button
              type="button"
              onClick={() =>
                void verifyPayment(devCheckout, {
                  razorpay_order_id: devCheckout.orderId,
                  razorpay_payment_id: '',
                  razorpay_signature: '',
                })
              }
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl"
            >
              <span>Proceed to Pay ₹{devCheckout.amount}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-12 text-center space-y-4 animate-in fade-in">
            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <h4 className="text-lg font-bold text-slate-900">Verifying Payment & Generating Registration...</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Please do not refresh this window. We are securing your seat and preparing your batch access.</p>
          </div>
        )}

        {step === 'failed' && (
          <div className="py-8 text-center space-y-4 animate-in fade-in" id="payment-failure-view">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Payment Could Not Be Completed</h4>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">Your payment was not successfully completed. Please try again or reach out to support.</p>
            <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
              <button type="button" onClick={() => setStep('form')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-sm">Try Again</button>
              <a href="https://wa.me/919996506041?text=Hi%2C%20my%20payment%20for%20the%20Articleship%20Masterclass%20failed.%20Can%20you%20help%3F" target="_blank" rel="noopener noreferrer" className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm px-6 py-3 rounded-xl inline-flex items-center justify-center">Contact Support</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
