import { redirect } from 'next/navigation';
import { getRole } from '@/lib/server/session';
import { RestaurantDashboard } from '@/components/donor/restaurant-dashboard';

export const dynamic = 'force-dynamic';

export default async function DonorPortalPage() {
  let role = null;
  try {
    role = await getRole('/donor');
  } catch (error) {
    // Fallback during local development if auth check redirects or fails
    console.error('Session role check in donor page:', error);
  }

  // If a role was determined and it's not donor, redirect to root
  if (role && role !== 'donor') redirect('/');

  return <RestaurantDashboard />;
}
