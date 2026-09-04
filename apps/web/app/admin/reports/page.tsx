import Link from 'next/link';
import { Building2, CalendarRange, FileText, Store } from 'lucide-react';

import { adminFetch } from '@/lib/server/admin';
import { StatusBadge } from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// --- Local, page-scoped types for the reports endpoints -------------------
// (kept out of lib/server/admin.ts to avoid colliding with concurrent
// work on that shared file).

interface MonthlyReportRow {
  month: string;
  kg: number;
  rescues: number;
  portions: number;
  meals: number;
}

interface MonthlyReport {
  year: number;
  months: MonthlyReportRow[];
  totals: { kg: number; rescues: number; portions: number };
}

interface RestaurantReportRow {
  id: string | null;
  name: string;
  type: string;
  city: string | null;
  status: string | null;
  verified: boolean;
  hygieneRating: number | null;
  published: number;
  active: number;
  rescuedCount: number;
  kg: number;
  meals: number;
}

interface RestaurantReport {
  rows: RestaurantReportRow[];
  totals: { kg: number; rescues: number; published: number };
}

interface CharityReportRow {
  id: string | null;
  name: string;
  type: string | null;
  city: string | null;
  status: string | null;
  verified: boolean;
  registrationNo: string | null;
  rescuedCount: number;
  kg: number;
  meals: number;
  lastRescueAt: string | null;
}

interface CharityReport {
  rows: CharityReportRow[];
  totals: { kg: number; rescues: number };
}

function getMonthlyReport(year?: number | string): Promise<MonthlyReport> {
  const params = new URLSearchParams();
  if (year) params.set('year', String(year));
  const qs = params.toString();
  return adminFetch<MonthlyReport>(`/reports/monthly${qs ? `?${qs}` : ''}`);
}

function getRestaurantsReport(): Promise<RestaurantReport> {
  return adminFetch<RestaurantReport>('/reports/restaurants');
}

function getCharitiesReport(): Promise<CharityReport> {
  return adminFetch<CharityReport>('/reports/charities');
}

interface PageProps {
  searchParams: Promise<{ view?: string; year?: string }>;
}

const VIEWS = [
  { key: 'monthly', label: 'Monthly statistics' },
  { key: 'restaurants', label: 'Restaurant contributions' },
  { key: 'charities', label: 'Charity statistics' },
];

function hrefFor(view: string, year?: string) {
  const params = new URLSearchParams();
  params.set('view', view);
  if (view === 'monthly' && year) params.set('year', year);
  const qs = params.toString();
  return `/admin/reports?${qs}`;
}

function fmt(n: number) {
  return n.toLocaleString();
}

function monthLabel(month: string) {
  const [y, m] = month.split('-');
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function maxKg(rows: { kg: number }[]) {
  return Math.max(...rows.map((r) => r.kg), 1);
}

function MonthlyTable({ year, report }: { year: number; report: MonthlyReport }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <th className="px-5 py-3">Month</th>
            <th className="px-4 py-3">Food rescued</th>
            <th className="px-4 py-3">Rescues</th>
            <th className="px-4 py-3">Portions</th>
            <th className="px-4 py-3 text-right">Estimated meals</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {report.months.map((row) => {
            const share = row.kg > 0 ? (row.kg / maxKg(report.months)) * 100 : 0;
            return (
              <tr
                key={row.month}
                className={cn('transition-colors hover:bg-muted/30', row.kg === 0 && 'opacity-50')}
              >
                <td className="px-5 py-3 font-bold text-foreground">{monthLabel(row.month)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.max(2, share)}%` }}
                      />
                    </div>
                    <span className="font-semibold text-foreground tabular">{fmt(row.kg)} kg</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground tabular">{fmt(row.rescues)}</td>
                <td className="px-4 py-3 text-muted-foreground tabular">{fmt(row.portions)}</td>
                <td className="px-4 py-3 text-right font-semibold text-foreground tabular">
                  {fmt(row.meals)}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-border bg-muted/40">
            <td className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {year} totals
            </td>
            <td className="px-4 py-3 font-extrabold text-foreground tabular">
              {fmt(report.totals.kg)} kg
            </td>
            <td className="px-4 py-3 font-bold text-foreground tabular">{fmt(report.totals.rescues)}</td>
            <td className="px-4 py-3 font-bold text-foreground tabular">{fmt(report.totals.portions)}</td>
            <td className="px-4 py-3" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function RestaurantsTable({ rows }: { rows: RestaurantReportRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[880px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <th className="px-5 py-3">Restaurant</th>
            <th className="px-4 py-3">Registry status</th>
            <th className="px-4 py-3 text-center">Published</th>
            <th className="px-4 py-3 text-center">Active</th>
            <th className="px-4 py-3 text-center">Rescues</th>
            <th className="px-4 py-3 text-right">Rescued</th>
            <th className="px-4 py-3 text-right">Meals</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.id ?? row.name} className="transition-colors hover:bg-muted/30">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Store className="size-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-foreground">{row.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {row.type}
                      {row.city ? ` · ${row.city}` : ''}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3.5">
                {row.status ? (
                  <div className="flex flex-col gap-1">
                    <StatusBadge status={row.status} />
                    {row.verified && (
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                        Hygiene {row.hygieneRating ?? '—'}/5
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Unregistered donor</span>
                )}
              </td>
              <td className="px-4 py-3.5 text-center text-muted-foreground tabular">{fmt(row.published)}</td>
              <td className="px-4 py-3.5 text-center text-muted-foreground tabular">{fmt(row.active)}</td>
              <td className="px-4 py-3.5 text-center text-muted-foreground tabular">{fmt(row.rescuedCount)}</td>
              <td className="px-4 py-3.5 text-right font-semibold text-foreground tabular">{fmt(row.kg)} kg</td>
              <td className="px-4 py-3.5 text-right text-muted-foreground tabular">{fmt(row.meals)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CharitiesTable({ rows }: { rows: CharityReportRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[880px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <th className="px-5 py-3">Organization</th>
            <th className="px-4 py-3">Registry status</th>
            <th className="px-4 py-3 text-center">Rescues</th>
            <th className="px-4 py-3 text-right">Received</th>
            <th className="px-4 py-3 text-right">Meals</th>
            <th className="px-4 py-3 text-right">Last rescue</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.id ?? row.name} className="transition-colors hover:bg-muted/30">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="size-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-foreground">{row.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {row.type}
                      {row.city ? ` · ${row.city}` : ''}
                      {row.registrationNo ? ` · ${row.registrationNo}` : ''}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3.5">
                {row.status ? (
                  <StatusBadge status={row.status} />
                ) : (
                  <span className="text-xs text-muted-foreground">Recipient only</span>
                )}
              </td>
              <td className="px-4 py-3.5 text-center text-muted-foreground tabular">{fmt(row.rescuedCount)}</td>
              <td className="px-4 py-3.5 text-right font-semibold text-foreground tabular">{fmt(row.kg)} kg</td>
              <td className="px-4 py-3.5 text-right text-muted-foreground tabular">{fmt(row.meals)}</td>
              <td className="px-4 py-3.5 text-right text-xs text-muted-foreground tabular">
                {row.lastRescueAt
                  ? new Date(row.lastRescueAt).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const view = sp.view === 'restaurants' || sp.view === 'charities' ? sp.view : 'monthly';
  const now = new Date();
  const years = [now.getFullYear() - 1, now.getFullYear()];
  const year = years.includes(Number(sp.year)) ? Number(sp.year) : now.getFullYear();

  let error: string | null = null;
  let monthly: MonthlyReport | null = null;
  let restaurants: RestaurantReport | null = null;
  let charities: CharityReport | null = null;

  try {
    if (view === 'monthly') monthly = await getMonthlyReport(year);
    else if (view === 'restaurants') restaurants = await getRestaurantsReport();
    else charities = await getCharitiesReport();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Could not load reports.';
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-[-0.02em] text-foreground sm:text-3xl">
            <FileText className="size-7 text-primary" />
            Reports
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monthly rescue statistics, restaurant contributions and charity impact.
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <p className="font-bold text-foreground">Could not load reports</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {VIEWS.map((v) => {
                const isActive = view === v.key;
                return (
                  <Button
                    key={v.key}
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
                    <Link href={hrefFor(v.key, String(year))}>{v.label}</Link>
                  </Button>
                );
              })}
            </div>

            {view === 'monthly' ? (
              <div className="flex items-center gap-1.5">
                <CalendarRange className="size-4 text-muted-foreground" />
                {years.map((y) => (
                  <Button
                    key={y}
                    asChild
                    variant="outline"
                    size="sm"
                    className={cn(
                      year === y &&
                        'bg-primary text-primary-foreground hover:bg-primary/90 border-primary',
                    )}
                  >
                    <Link href={hrefFor('monthly', String(y))}>{y}</Link>
                  </Button>
                ))}
              </div>
            ) : null}
          </div>

          {view === 'monthly' && monthly ? (
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-border bg-muted/20 px-6 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {year} rescued
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-primary tabular">
                    {fmt(monthly.totals.kg)} <span className="text-sm font-bold">kg</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Rescues
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-foreground tabular">
                    {fmt(monthly.totals.rescues)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Portions
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-foreground tabular">
                    {fmt(monthly.totals.portions)}
                  </p>
                </div>
              </div>
              <MonthlyTable year={year} report={monthly} />
            </div>
          ) : null}

          {view === 'restaurants' && restaurants ? (
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-border bg-muted/20 px-6 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Rescued (all donors)
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-primary tabular">
                    {fmt(restaurants.totals.kg)} <span className="text-sm font-bold">kg</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Rescues
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-foreground tabular">
                    {fmt(restaurants.totals.rescues)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Listings published
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-foreground tabular">
                    {fmt(restaurants.totals.published)}
                  </p>
                </div>
              </div>
              <RestaurantsTable rows={restaurants.rows} />
            </div>
          ) : null}

          {view === 'charities' && charities ? (
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-border bg-muted/20 px-6 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Received (kg)
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-primary tabular">
                    {fmt(charities.totals.kg)} <span className="text-sm font-bold">kg</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Rescues received
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-foreground tabular">
                    {fmt(charities.totals.rescues)}
                  </p>
                </div>
              </div>
              <CharitiesTable rows={charities.rows} />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
