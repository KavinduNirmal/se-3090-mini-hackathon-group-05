import Link from 'next/link';
import { HeartHandshake, Search } from 'lucide-react';

import { listCharities } from '@/lib/server/admin';
import { CharitiesTable } from '@/components/admin/charities-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ status?: string; q?: string }>;
}

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending review' },
  { key: 'active', label: 'Active' },
  { key: 'rejected', label: 'Rejected' },
];

function hrefFor(status: string, q: string | undefined) {
  const params = new URLSearchParams();
  if (status !== 'all') params.set('status', status);
  if (q) params.set('q', q);
  const qs = params.toString();
  return `/admin/charities${qs ? `?${qs}` : ''}`;
}

export default async function AdminCharitiesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const status = sp.status && sp.status !== 'all' ? sp.status : undefined;
  const q = sp.q;

  let charities: Awaited<ReturnType<typeof listCharities>> = [];
  let error: string | null = null;
  try {
    charities = await listCharities({ status, q });
  } catch (err) {
    error = err instanceof Error ? err.message : 'Could not load charities.';
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-[-0.02em] text-foreground sm:text-3xl">
            <HeartHandshake className="size-7 text-primary" />
            Charity verification
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review registrations and verify organizations before they can reserve donations.
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <p className="font-bold text-foreground">Could not load charities</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              {TABS.map((tab) => {
                const isActive =
                  tab.key === 'all'
                    ? !sp.status || sp.status === 'all'
                    : sp.status === tab.key;
                return (
                  <Button
                    key={tab.key}
                    asChild
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'rounded-full',
                      isActive
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Link href={hrefFor(tab.key, q)}>{tab.label}</Link>
                  </Button>
                );
              })}
            </div>

            <form action="/admin/charities" method="GET" className="flex w-full items-center gap-2 sm:w-auto">
              <input type="hidden" name="status" value={sp.status ?? 'all'} />
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="q"
                  defaultValue={q}
                  placeholder="Search name, type, city or reg no…"
                  className="bg-card pl-9"
                />
              </div>
              <Button type="submit" variant="outline" size="sm" className="shrink-0">
                Search
              </Button>
            </form>
          </div>

          <p className="text-xs text-muted-foreground">
            Showing {charities.length} organization{charities.length === 1 ? '' : 's'}
            {status ? ` · ${status}` : ''}
            {q ? ` · matching “${q}”` : ''}
          </p>

          <CharitiesTable charities={charities} />
        </>
      )}
    </div>
  );
}
