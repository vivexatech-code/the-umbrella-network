'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Batch, PaymentSuccessResponse } from '@/lib/types';

interface RegistrationContextValue {
  batches: Batch[];
  activeBatch: Batch | null;
  openRegistration: (batch?: Batch) => void;
  closeRegistration: () => void;
  isRegistrationOpen: boolean;
  isRazorpayOpen: boolean;
  setRazorpayOpen: (open: boolean) => void;
  successData: PaymentSuccessResponse | null;
  setSuccessData: (data: PaymentSuccessResponse | null) => void;
  selectedBatch: Batch | null;
}

const RegistrationContext = createContext<RegistrationContextValue | null>(null);

export function useRegistration() {
  const value = useContext(RegistrationContext);
  if (!value) throw new Error('Registration controls are unavailable.');
  return value;
}

export function RegistrationProvider({
  children,
  batches,
  activeBatch,
}: {
  children: React.ReactNode;
  batches: Batch[];
  activeBatch: Batch | null;
}) {
  const [isRegistrationOpen, setRegistrationOpen] = useState(false);
  const [isRazorpayOpen, setRazorpayOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(activeBatch);
  const [successData, setSuccessData] = useState<PaymentSuccessResponse | null>(null);

  const value = useMemo<RegistrationContextValue>(
    () => ({
      batches,
      activeBatch,
      isRegistrationOpen,
      isRazorpayOpen,
      setRazorpayOpen,
      successData,
      setSuccessData,
      selectedBatch,
      openRegistration: (batch?: Batch) => {
        setSelectedBatch(batch || activeBatch || batches[0] || null);
        setRegistrationOpen(true);
      },
      closeRegistration: () => setRegistrationOpen(false),
    }),
    [activeBatch, batches, isRazorpayOpen, isRegistrationOpen, selectedBatch, successData],
  );

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  );
}
