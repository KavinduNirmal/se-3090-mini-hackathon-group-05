import type { LucideIcon } from 'lucide-react';
import { Trophy } from 'lucide-react';

import type { ImpactRankedEntry } from '@/lib/server/admin';
import { cn } from '@/lib/utils';

interface RankedListProps {
  title: string;
  subtitle?: string;
  items: ImpactRankedEntry[];
  icon: LucideIcon;
  /** Tailwind color classes for the rank badge + share bar. */
  tone: string;
  highlightFirst?: boolean;
}

function maxKg(items: ImpactRankedEntry[]) {
  return items.reduce((max, item) => Math.max(max, item.kg), 0) || 1;
}

export function RankedList({
  title,
  subtitle,
  items,
  icon: Icon,
  tone,
  highlightFirst = false,
}: RankedListProps) {
  const max = maxKg(items);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-5 py-4">
        <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl', tone)}>
          <Icon className="size-4.5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-muted-foreground">
          Not enough rescue data yet — contributions will appear here once donations are collected.
        </div>
      ) : (
        <ol className="divide-y divide-border">
          {items.map((item, index) => {
            const isFirst = highlightFirst && index === 0;
            return (
              <li
                key={item.name}
                className={cn('flex items-center gap-4 px-5 py-3.5', isFirst && 'bg-primary/[0.04]')}
              >
                <span
                  className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-full text-xs font-extrabold tabular',
                    index === 0
                      ? 'bg-secondary/15 text-secondary'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {index === 0 && highlightFirst ? <Trophy className="size-4" /> : index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-bold text-foreground">
                      {item.name}
                      {item.type ? (
                        <span className="ml-2 hidden font-medium text-muted-foreground sm:inline">
                          {item.type}
                        </span>
                      ) : null}
                    </p>
                    <p className="shrink-0 text-sm font-extrabold text-foreground tabular">
                      {item.kg.toLocaleString()}
                      <span className="ml-1 text-xs font-semibold text-muted-foreground">kg</span>
                    </p>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn('h-full rounded-full', index === 0 && highlightFirst ? 'bg-secondary' : 'bg-primary')}
                        style={{ width: `${Math.max(4, (item.kg / max) * 100)}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground tabular">
                      {item.rescues} rescue{item.rescues === 1 ? '' : 's'} · ≈{' '}
                      {item.meals.toLocaleString()} meals
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
