'use client';

import { ArrowRight } from 'lucide-react';
import type { Batch } from '@/lib/types';
import { useRegistration } from '@/components/site/registration-context';

export function JoinButton({
  label,
  batch,
  className,
  id,
}: {
  label: string;
  batch?: Batch | null;
  className: string;
  id?: string;
}) {
  const { openRegistration } = useRegistration();
  return (
    <button id={id} type="button" onClick={() => openRegistration(batch || undefined)} className={className}>
      <span>{label}</span>
      <ArrowRight className="w-4 h-4" />
    </button>
  );
}
