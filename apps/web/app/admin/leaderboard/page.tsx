import { AlertTriangle, HeartHandshake, Leaf, Store, Trophy } from 'lucide-react';

import { getImpact } from '@/lib/server/admin';
import { RankedList } from '@/components/admin/impact/ranked-list';

export const dynamic = 'force-dynamic';

export default async function AdminLeaderboardPage() {
  let impact: Awaited<ReturnType<typeof getImpact>> | null = null;
  let error: string | null = null;

  try {
    impact = await getImpact();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Could not load the rescue leaderboard.';
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
            <AlertTriangle className="size-7" />
          </span>
          <h1 className="mt-4 text-lg font-bold text-foreground">Leaderboard unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const data = impact!;
  const champion = data.topRestaurants[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-[-0.02em] text-foreground sm:text-3xl">
          <Trophy className="size-7 text-secondary" />
          Rescue leaderboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The restaurants and charities driving the most rescued food on Share a Plate.
        </p>
      </div>

      {champion ? (
        <section className="overflow-hidden rounded-2xl border border-secondary/30 bg-gradient-to-br from-amber-50 via-background to-emerald-50 p-6 dark:from-amber-950/30 dark:via-background dark:to-emerald-950/25 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
                <Trophy className="size-4" /> Leading donor
              </p>
              <p className="text-3xl font-extrabold tracking-tight text-foreground">
                {champion.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {champion.rescues} rescue{champion.rescues === 1 ? '' : 's'} contributing{' '}
                <span className="font-bold text-foreground tabular">{champion.kg.toLocaleString()} kg</span>{' '}
                · ≈ {champion.meals.toLocaleString()} meals served
              </p>
            </div>
            <div className="grid shrink-0 grid-cols-2 gap-2 text-center sm:grid-cols-1 sm:text-right">
              <div>
                <p className="text-2xl font-extrabold text-foreground tabular">
                  {champion.kg.toLocaleString()}
                </p>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  kg rescued
                </p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-foreground tabular">
                  {champion.meals.toLocaleString()}
                </p>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  meals
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RankedList
          title="Top donating restaurants"
          subtitle="All-time rank by kilograms rescued"
          items={data.topRestaurants}
          icon={Store}
          tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          highlightFirst
        />
        <RankedList
          title="Top recipient charities"
          subtitle="All-time rank by kilograms received"
          items={data.topCharities}
          icon={HeartHandshake}
          tone="bg-sky-500/10 text-sky-600 dark:text-sky-400"
          highlightFirst
        />
      </section>

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <Leaf className="mt-0.5 size-3.5 shrink-0 text-primary" />
        Rankings are built from completed rescues (donations collected by a charity). Weight is the
        donation&apos;s listed kilograms; meals assume 0.4 kg per serving.
      </p>
    </div>
  );
}
