import Link from 'next/link';
import { Package, ScanEye } from 'lucide-react';

import { listDonations } from '@/lib/server/admin';
import { DonationsTable } from '@/components/admin/donations-table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ status?: string; flagged?: string }>;
}

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'claimed', label: 'Claimed' },
  { key: 'collected', label: 'Collected' },
  { key: 'expired', label: 'Expired' },
  { key: 'removed', label: 'Removed' },
];

function hrefFor(status: string, flagged: string | undefined) {
  const params = new URLSearchParams();
  if (status !== 'all') params.set('status', status);
  if (status === 'flagged') params.set('flagged', 'true');
  if (flagged && status !== 'flagged') params.set('flagged', flagged);
  const qs = params.toString();
  return `/admin/donations${qs ? `?${qs}` : ''}`;
}

export default async function AdminDonationsPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const isFlaggedTab = sp.status === 'flagged';
  const status = !isFlaggedTab && sp.status && sp.status !== 'all' ? sp.status : undefined;
  const flagged = isFlaggedTab ? 'true' : undefined;

  let donations: Awaited<ReturnType<typeof listDonations>> = [];
  let error: string | null = null;
  try {
    donations = await listDonations({ status, flagged });
  } catch (err) {
    error = err instanceof Error ? err.message : 'Could not load donations.';
  }

  const flaggedCount = donations.filter((d) => d.flagged).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-[-0.02em] text-foreground sm:text-3xl">
            <ScanEye className="size-7 text-primary" />
            Donation monitoring
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review every food listing on the platform, flag suspicious posts and remove invalid
            donations.
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <p className="font-bold text-foreground">Could not load donations</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {TABS.map((tab) => {
                const isActive = tab.key === 'all' ? !sp.status : sp.status === tab.key;
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
                    <Link href={hrefFor(tab.key, sp.flagged)}>{tab.label}</Link>
                  </Button>
                );
              })}
              <Button
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                  'rounded-full',
                  isFlaggedTab
                    ? 'bg-secondary text-white hover:bg-secondary/90'
                    : 'text-secondary hover:bg-amber-500/10 hover:text-secondary',
                )}
              >
                <Link href="/admin/donations?status=flagged">Flagged</Link>
              </Button>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Package className="size-3.5" />
              {isFlaggedTab
                ? `${flaggedCount} flagged listing${flaggedCount === 1 ? '' : 's'}`
                : `${donations.length} listing${donations.length === 1 ? '' : 's'}`}
              {status && !isFlaggedTab ? ` · ${status}` : ''}
            </span>
          </div>

          <DonationsTable donations={donations} />
        </>
      )}
    </div>
  );
}
