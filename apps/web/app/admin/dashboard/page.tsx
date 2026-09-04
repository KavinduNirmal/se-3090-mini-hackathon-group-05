import Link from 'next/link';
import { auth, clerkClient } from '@clerk/nextjs/server';
import {
  AlertTriangle,
  CheckCircle2,
  Flame,
  HeartHandshake,
  Leaf,
  Package,
  Store,
  UtensilsCrossed,
} from 'lucide-react';

import { getOverview, type OverviewData } from '@/lib/server/admin';
import { StatCard } from '@/components/admin/stat-card';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

function mealEstimate(kg: number) {
  return Math.floor(kg / 0.4);
}

function greetingFor(firstName: string | null): string {
  const hour = new Date().getHours();
  const period = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return firstName ? `${period}, ${firstName}` : 'Good day, operator';
}

async function currentAdminFirstName(): Promise<string | null> {
  try {
    const { userId } = await auth();
    if (!userId) return null;
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.firstName || user.username || null;
  } catch {
    return null;
  }
}

export default async function AdminDashboardPage() {
  const firstName = await currentAdminFirstName();
  let overview: OverviewData | null = null;
  let error: string | null = null;

  try {
    overview = await getOverview();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Could not load dashboard data.';
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
            <AlertTriangle className="size-7" />
          </span>
          <h1 className="mt-4 text-lg font-bold text-foreground">Dashboard unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/admin/dashboard">Try again</Link>
          </Button>
        </div>
      </div>
    );
  }

  const {
    totalRestaurants,
    totalCharities,
    restaurantsByStatus,
    charitiesByStatus,
    donationsByStatus,
    activeDonations,
    claimedDonations,
    completedRescues,
    expiredDonations,
    removedDonations,
    flaggedDonations,
    totalKgRescued,
  } = overview!;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-foreground sm:text-3xl">
          {greetingFor(firstName)}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live overview of registrations, donations and rescued food across Share a Plate.
        </p>
      </div>

      {/* Primary impact banner */}
      <section className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-emerald-50 via-background to-amber-50 p-6 dark:from-emerald-950/40 dark:via-background dark:to-amber-950/30 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Leaf className="size-4" /> Food rescued to date
            </p>
            <p className="text-5xl font-extrabold tracking-tight text-foreground tabular sm:text-6xl">
              {totalKgRescued.toLocaleString()}
              <span className="ml-2 text-2xl font-bold text-muted-foreground">kg</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              ≈ {mealEstimate(totalKgRescued).toLocaleString()} estimated meals served at 0.4 kg
              per serving.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
            <Button asChild variant="secondary" size="lg" className="h-12 justify-between px-5">
              <Link href="/admin/reports">
                View reports
                <UtensilsCrossed className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Network & activity stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Registered restaurants"
          value={totalRestaurants}
          icon={Store}
          tone="emerald"
          hint={`${restaurantsByStatus.active} verified & active · ${restaurantsByStatus.pending} awaiting review`}
        />
        <StatCard
          label="Registered charities"
          value={totalCharities}
          icon={HeartHandshake}
          tone="sky"
          hint={`${charitiesByStatus.active} verified & active · ${charitiesByStatus.pending} awaiting review`}
        />
        <StatCard
          label="Active donations"
          value={activeDonations}
          icon={Package}
          tone="default"
          hint={`${claimedDonations} claim${claimedDonations === 1 ? '' : 's'} in progress`}
        />
        <StatCard
          label="Completed rescues"
          value={completedRescues}
          icon={CheckCircle2}
          tone="lime"
          hint="Donations delivered to charities"
        />
        <StatCard
          label="Flagged donations"
          value={flaggedDonations}
          icon={AlertTriangle}
          tone="red"
          hint="Listings needing operations review"
        />
        <StatCard
          label="Expired / removed"
          value={expiredDonations + removedDonations}
          icon={Flame}
          tone="amber"
          hint={`${expiredDonations} expired · ${removedDonations} removed by admin`}
        />
      </section>

      {/* Donation status flow */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-foreground">Donation lifecycle</h2>
            <p className="text-xs text-muted-foreground">
              How the {donationsByStatus.active + donationsByStatus.claimed + donationsByStatus.collected} current
              listings are moving through the rescue pipeline.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/donations">Monitor donations</Link>
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: 'Live & active', value: donationsByStatus.active, color: 'text-primary', bar: 'bg-primary' },
            { label: 'Claimed', value: donationsByStatus.claimed, color: 'text-secondary', bar: 'bg-secondary' },
            { label: 'Collected', value: donationsByStatus.collected, color: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500' },
            { label: 'Expired', value: donationsByStatus.expired, color: 'text-slate-500', bar: 'bg-slate-400' },
            { label: 'Removed', value: donationsByStatus.removed, color: 'text-red-600 dark:text-red-400', bar: 'bg-red-500' },
          ].map((stage) => {
            const total = activeDonations + claimedDonations + completedRescues + expiredDonations + removedDonations || 1;
            return (
              <div key={stage.label} className="rounded-xl border border-border bg-background p-3">
                <p className={`text-2xl font-extrabold tracking-tight tabular ${stage.color}`}>
                  {stage.value}
                </p>
                <p className="text-xs font-semibold text-muted-foreground">{stage.label}</p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${stage.bar}`}
                    style={{ width: `${Math.max(2, (stage.value / total) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
