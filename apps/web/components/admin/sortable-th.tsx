import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';

export type SortDir = 'asc' | 'desc';

interface SortableThProps {
  label: string;
  sortKey: string;
  activeKey: string;
  dir: SortDir;
  onSort: (key: string) => void;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function SortableTh({ label, sortKey, activeKey, dir, onSort, className, align = 'left' }: SortableThProps) {
  const active = activeKey === sortKey;
  return (
    <th
      aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={cn(
        'px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground',
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          'inline-flex items-center gap-1 uppercase tracking-wider transition-colors',
          active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        {label}
        {active ? (
          dir === 'asc' ? (
            <ChevronUp className="size-3.5" />
          ) : (
            <ChevronDown className="size-3.5" />
          )
        ) : (
          <ChevronsUpDown className="size-3 opacity-50" />
        )}
      </button>
    </th>
  );
}
