import type { ReactNode } from 'react';

import { requireAdmin } from '@/lib/server/session';
import { AdminNav } from '@/components/admin/admin-nav';
import { AuthNav } from '@/components/auth-nav';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin('/admin/dashboard');

  return (
    <div className="min-h-dvh bg-background lg:flex">
      <aside className="sticky top-0 z-30 h-16 shrink-0 border-b border-border bg-card lg:h-dvh lg:w-64 lg:border-b-0 lg:border-r">
        <AdminNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
          <span className="text-sm font-semibold text-muted-foreground lg:hidden">
            Admin Console
          </span>
          <div className="ml-auto flex items-center gap-3">
            <AuthNav />
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
