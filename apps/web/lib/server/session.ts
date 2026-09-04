import { notFound, redirect } from 'next/navigation';
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

/**
 * Guards /admin/* routes. Only users whose Clerk publicMetadata
 * `role` equals "admin" (the Share a Plate team) may pass.
 * Signed-out users are redirected to sign-in; signed-in non-admins
 * receive a 404 so the admin area stays undiscoverable.
 */
export async function requireAdmin(returnPath = '/admin'): Promise<void> {
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent(returnPath)}`);

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = user.publicMetadata?.role ?? user.unsafeMetadata?.role;

  if (role !== 'admin') notFound();
}
