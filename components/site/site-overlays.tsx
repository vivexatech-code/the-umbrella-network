'use client';

import { JoinPopup } from '@/components/site/join-popup';
import { RegistrationModal } from '@/components/site/registration-modal';
import { useRegistration } from '@/components/site/registration-context';
import { SuccessPageModal } from '@/components/site/success-modal';

export function SiteOverlays() {
  const { successData, setSuccessData } = useRegistration();
  return (
    <>
      <RegistrationModal />
      <SuccessPageModal data={successData} onClose={() => setSuccessData(null)} />
      <JoinPopup />
    </>
  );
}
