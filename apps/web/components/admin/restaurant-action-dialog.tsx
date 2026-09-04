'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import {
  CheckCircle2,
  LoaderCircle,
  PauseCircle,
  ShieldCheck,
  Store,
  X,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import type { AdminRestaurant } from '@/lib/server/admin';
import { StatusBadge } from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type RestaurantAction = 'verify' | 'suspend' | 'reject';

const ACTION_META: Record<
  RestaurantAction,
  { title: string; blurb: string; confirm: string; icon: typeof CheckCircle2 }
> = {
  verify: {
    title: 'Verify & activate',
    blurb:
      'Approve this registration. The restaurant becomes verified and its surplus food is offered to charities.',
    confirm: 'Verify restaurant',
    icon: CheckCircle2,
  },
  suspend: {
    title: 'Suspend restaurant',
    blurb:
      'Temporarily block this restaurant from the platform. Its live listings will stop being offered to charities.',
    confirm: 'Suspend restaurant',
    icon: PauseCircle,
  },
  reject: {
    title: 'Reject registration',
    blurb:
      'Reject this application. The restaurant will not be able to donate food through Share a Plate.',
    confirm: 'Reject registration',
    icon: XCircle,
  },
};

interface RestaurantActionDialogProps {
  restaurant: AdminRestaurant;
  action: RestaurantAction;
  onClose: () => void;
}

export function RestaurantActionDialog({ restaurant, action, onClose }: RestaurantActionDialogProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const meta = ACTION_META[action];
  const Icon = meta.icon;

  const isDestructive = action === 'reject';
  const isPositive = action === 'verify';

  async function run() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/restaurants/${restaurant.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || body?.status !== 'success') {
        throw new Error(body?.message || `Request failed (${res.status})`);
      }
      toast.success(
        action === 'verify'
          ? 'Restaurant verified'
          : action === 'suspend'
            ? 'Restaurant suspended'
            : 'Restaurant rejected',
        { description: restaurant.name },
      );
      onClose();
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error';
      setError(message);
      toast.error('Action failed', { description: message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => (busy ? null : onClose())} />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-4 px-6 py-5">
          <span
            className={
              isPositive
                ? 'grid size-11 place-items-center rounded-xl bg-primary/10 text-primary'
                : isDestructive
                  ? 'grid size-11 place-items-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400'
                  : 'grid size-11 place-items-center rounded-xl bg-secondary/10 text-secondary'
            }
          >
            <Icon className="size-5" />
          </span>
          <button
            onClick={() => (busy ? null : onClose())}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="px-6">
          <h2 className="text-lg font-bold tracking-tight text-foreground">{meta.title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{meta.blurb}</p>
        </div>

        <div className="mx-6 mt-5 flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Store className="size-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">{restaurant.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {restaurant.type}
              {restaurant.city ? ` · ${restaurant.city}` : ''}
              {restaurant.licenseNo ? ` · ${restaurant.licenseNo}` : ''}
            </p>
          </div>
          <StatusBadge status={restaurant.status} />
        </div>

        {restaurant.verified && action === 'verify' ? (
          <p className="mx-6 mt-3 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <ShieldCheck className="size-3.5" />
            Already verified — this will refresh its status to active.
          </p>
        ) : null}

        {error ? (
          <p className="mx-6 mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-border bg-muted/20 px-6 py-4">
          <Button variant="outline" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={isDestructive ? 'outline' : isPositive ? 'default' : 'secondary'}
            className={isDestructive ? 'gap-1.5 border-red-600/30 text-red-700 hover:bg-red-500/10 dark:text-red-400' : undefined}
            disabled={busy}
            onClick={run}
          >
            {busy ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Icon className="mr-2 size-4" />}
            {busy ? 'Updating…' : meta.confirm}
          </Button>
        </div>
      </div>
    </div>
  );
}
