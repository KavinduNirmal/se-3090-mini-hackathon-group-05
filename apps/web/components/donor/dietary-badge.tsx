import React from 'react';
import { Moon, Triangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DietaryType = 'halal' | 'veg' | 'non-veg' | 'gluten-free' | 'dairy-free';

interface DietaryBadgeProps {
  type: DietaryType | string;
  className?: string;
}

export function DietaryBadge({ type, className }: DietaryBadgeProps) {
  const normalized = type.toLowerCase();

  if (normalized === 'halal') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold transition-all',
          'border border-[#059669] bg-[#059669]/10 text-[#047857] dark:bg-[#059669]/20 dark:text-[#34d399]',
          className
        )}
      >
        <Moon className="size-3 fill-current stroke-none" />
        <span>Halal</span>
      </span>
    );
  }

  if (normalized === 'veg' || normalized === 'pure-veg' || normalized === 'pure veg') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all',
          'border border-[#16a34a] bg-[#16a34a]/10 text-[#15803d] dark:bg-[#16a34a]/20 dark:text-[#4ade80]',
          className
        )}
      >
        <span className="size-2 rounded-sm bg-[#16a34a] dark:bg-[#4ade80]" />
        <span>Pure Veg</span>
      </span>
    );
  }

  if (normalized === 'non-veg' || normalized === 'non veg') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all',
          'border border-[#dc2626] bg-[#dc2626]/10 text-[#991b1b] dark:bg-[#dc2626]/20 dark:text-[#f87171]',
          className
        )}
      >
        <Triangle className="size-2 fill-current rotate-180" />
        <span>Non-Veg</span>
      </span>
    );
  }

  // Default fallback badge
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border border-border bg-muted text-muted-foreground',
        className
      )}
    >
      {type}
    </span>
  );
}
