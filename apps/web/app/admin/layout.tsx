import type { ReactNode } from 'react';

import { requireAdmin } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin('/admin/dashboard');
  return <>{children}</>;
}
