import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

type Tone = 'default' | 'emerald' | 'amber' | 'lime' | 'red' | 'sky' | 'slate';

const TONES: Record<Tone, { icon: string; glow: string; bar: string }> = {
  default: { icon: 'text-primary', glow: 'bg-primary/10', bar: 'bg-primary' },
  emerald: { icon: 'text-emerald-600 dark:text-emerald-400', glow: 'bg-emerald-500/10', bar: 'bg-emerald-500' },
  amber: { icon: 'text-secondary', glow: 'bg-secondary/10', bar: 'bg-secondary' },
  lime: { icon: 'text-lime-600 dark:text-lime-400', glow: 'bg-lime-500/10', bar: 'bg-lime-500' },
  red: { icon: 'text-red-600 dark:text-red-400', glow: 'bg-red-500/10', bar: 'bg-red-500' },
  sky: { icon: 'text-sky-600 dark:text-sky-400', glow: 'bg-sky-500/10', bar: 'bg-sky-500' },
  slate: { icon: 'text-slate-600 dark:text-slate-400', glow: 'bg-slate-500/10', bar: 'bg-slate-400' },
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: Tone;
  hint?: string;
  suffix?: string;
}

export function StatCard({ label, value, icon: Icon, tone = 'default', hint, suffix }: StatCardProps) {
  const colors = TONES[tone];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-foreground tabular">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {suffix ? (
              <span className="text-sm font-semibold text-muted-foreground">{suffix}</span>
            ) : null}
          </p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <span
          className={cn(
            'grid size-11 shrink-0 place-items-center rounded-xl',
            colors.glow,
            colors.icon,
          )}
        >
          <Icon className="size-5" />
        </span>
      </div>
      <div className={cn('absolute inset-x-0 top-0 h-0.5', colors.bar)} />
    </div>
  );
}
