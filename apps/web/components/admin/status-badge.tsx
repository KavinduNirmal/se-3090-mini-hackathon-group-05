import { cn } from '@/lib/utils';

// Status -> tone mapping shared across restaurants, charities and donations.
// Tones follow the DESIGN.md semantic palette (emerald = good, amber = pending,
// red = blocked, slate = finished/expired, sky = in progress).
const STATUS_TONES: Record<string, string> = {
  pending: 'border-amber-600/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  active: 'border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  verified: 'border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  suspended: 'border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-300',
  rejected: 'border-red-600/30 bg-red-500/10 text-red-700 dark:text-red-400',
  removed: 'border-red-600/30 bg-red-500/10 text-red-700 dark:text-red-400',
  claimed: 'border-sky-600/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  collected: 'border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  expired: 'border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-300',
};

const DEFAULTS: Record<string, string> = {
  dot: 'bg-emerald-500',
  dotMuted: 'bg-slate-400',
};

function labelFor(status: string) {
  if (status === 'pending') return 'Pending review';
  if (status === 'active') return 'Active';
  if (status === 'rejected') return 'Rejected';
  if (status === 'suspended') return 'Suspended';
  if (status === 'collected') return 'Collected';
  if (status === 'expired') return 'Expired';
  if (status === 'removed') return 'Removed';
  if (status === 'claimed') return 'Claimed';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONES[status] ?? STATUS_TONES.suspended;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize',
        tone,
      )}
    >
      <span
        className={cn(
          'size-1.5 rounded-full',
          DEFAULTS.dot,
          (status === 'expired' || status === 'rejected' || status === 'removed' || status === 'suspended') && 'bg-current',
        )}
      />
      {labelFor(status)}
    </span>
  );
}
