import { redirect } from 'next/navigation';
import { getRole } from '@/lib/server/session';
import { AddDonationForm } from '@/components/donor/add-donation-form';

export const dynamic = 'force-dynamic';

export default async function AddDonationPage() {
  let role = null;
  try {
    role = await getRole('/donor/create');
  } catch (error) {
    console.error('Session role check in add donation page:', error);
  }

  if (role && role !== 'donor') redirect('/');

  return <AddDonationForm />;
}
