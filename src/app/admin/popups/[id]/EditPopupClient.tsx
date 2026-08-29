'use client';

import { useRouter } from 'next/navigation';
import type { Popup } from '../../../../types';
import PopupForm from '../PopupForm';

export default function EditPopupClient({ popup }: { popup: Popup }) {
  const router = useRouter();
  return (
    <PopupForm popup={popup} onSuccess={() => router.push('/admin/popups')} />
  );
}
