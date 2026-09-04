import type { ReactNode } from 'react';
import { AlertTriangle, BarChart3, CalendarRange, HeartHandshake, Leaf, Store, UtensilsCrossed } from 'lucide-react';

import { getImpact } from '@/lib/server/admin';
import { StatCard } from '@/components/admin/stat-card';
import { RankedList } from '@/components/admin/impact/ranked-list';
import { CategoryChart } from '@/components/admin/impact/category-chart';
import { TrendChart } from '@/components/admin/impact/trend-chart';

export const dynamic = 'force-dynamic';

function SectionCard({
  title,
  subtitle,
  children,
  className = '',
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm ${className}`}>
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-bold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex-1 p-5">{children}</div>
    </div>
  );
}

export default async function AdminImpactPage() {
  let impact: Awaited<ReturnType<typeof getImpact>> | null = null;
  let error: string | null = null;

  try {
    impact = await getImpact();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Could not load impact analytics.';
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
            <AlertTriangle className="size-7" />
          </span>
          <h1 className="mt-4 text-lg font-bold text-foreground">Impact analytics unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const data = impact!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-[-0.02em] text-foreground sm:text-3xl">
          <BarChart3 className="size-7 text-primary" />
          Impact analytics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          How much surplus food Share a Plate has rescued and who made it happen.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Food rescued"
          value={data.totalKg.toLocaleString()}
          suffix="kg"
          icon={Leaf}
          tone="emerald"
          hint={`${data.rescuesCompleted} completed rescues to date`}
        />
        <StatCard
          label="Meals served"
          value={data.mealsServed.toLocaleString()}
          icon={UtensilsCrossed}
          tone="default"
          hint="Estimated at 0.4 kg per meal"
        />
        <StatCard
          label="Rescued this week"
          value={data.weekKg.toLocaleString()}
          suffix="kg"
          icon={CalendarRange}
          tone="lime"
          hint={`${data.weekRescues} rescue${data.weekRescues === 1 ? '' : 's'} in the last 7 days`}
        />
        <StatCard
          label="Rescued this month"
          value={data.monthKg.toLocaleString()}
          suffix="kg"
          icon={CalendarRange}
          tone="amber"
          hint={`${data.monthRescues} rescue${data.monthRescues === 1 ? '' : 's'} in the last 30 days`}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Rescued volume by category" subtitle="Kilograms delivered, split by food category">
          <CategoryChart data={data.byCategory} />
        </SectionCard>
        <SectionCard title="Monthly rescue trend" subtitle="Kilograms rescued over the last six months">
          <TrendChart data={data.trend} />
        </SectionCard>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RankedList
          title="Top donating restaurants"
          subtitle="Ranked by total kilograms rescued"
          items={data.topRestaurants}
          icon={Store}
          tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <RankedList
          title="Top recipient charities"
          subtitle="Ranked by total kilograms received"
          items={data.topCharities}
          icon={HeartHandshake}
          tone="bg-sky-500/10 text-sky-600 dark:text-sky-400"
        />
      </section>
    </div>
  );
}
