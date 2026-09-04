import { redirect } from 'next/navigation';
import { auth, clerkClient } from '@clerk/nextjs/server';
import type { UserRole } from '@/lib/account-types';

export const dynamic = 'force-dynamic';

export async function getRole(returnPath: string): Promise<UserRole | null> {
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent(returnPath)}`);

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = user.unsafeMetadata?.role;
  return role === 'donor' || role === 'charity' ? role : null;
}
