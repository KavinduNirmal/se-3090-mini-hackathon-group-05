'use client';

import { useState } from 'react';
import { ShieldCheck, Store } from 'lucide-react';

import type { AdminRestaurant } from '@/lib/server/admin';
import {
  RestaurantActionDialog,
  type RestaurantAction,
} from '@/components/admin/restaurant-action-dialog';
import { StatusBadge } from '@/components/admin/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Available actions per restaurant status (mirrors the server's transition rules).
const ACTIONS_BY_STATUS: Record<string, RestaurantAction[]> = {
  pending: ['verify', 'reject'],
  active: ['suspend'],
  suspended: ['verify', 'reject'],
};

export function RestaurantsTable({ restaurants }: { restaurants: AdminRestaurant[] }) {
  const [target, setTarget] = useState<{ restaurant: AdminRestaurant; action: RestaurantAction } | null>(null);

  if (restaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <Store className="size-6" />
        </span>
        <h3 className="mt-4 font-bold text-foreground">No restaurants found</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          No restaurants match the current filters.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Restaurant</th>
                <th className="px-4 py-3">License & hygiene</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {restaurants.map((restaurant) => {
                const actions = ACTIONS_BY_STATUS[restaurant.status] ?? [];
                return (
                  <tr key={restaurant.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                          <Store className="size-4.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-foreground">{restaurant.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {restaurant.type}
                            {restaurant.city ? ` · ${restaurant.city}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-foreground tabular">
                        {restaurant.licenseNo ?? '—'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {restaurant.hygieneRating != null
                          ? `Hygiene ${restaurant.hygieneRating}/5`
                          : 'No hygiene rating'}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground tabular">
                      {restaurant.phone ?? '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={restaurant.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      {restaurant.verified ? (
                        <Badge variant="outline" className="gap-1 border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                          <ShieldCheck className="size-3" /> Verified
                        </Badge>
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground">Not verified</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground tabular">
                      {formatDate(restaurant.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-1.5">
                        {actions.length === 0 ? (
                          <span className="text-xs text-muted-foreground">No actions</span>
                        ) : (
                          actions.map((action) => (
                            <Button
                              key={action}
                              size="sm"
                              variant={
                                action === 'verify'
                                  ? 'default'
                                  : action === 'suspend'
                                    ? 'secondary'
                                    : 'outline'
                              }
                              className={
                                action === 'reject'
                                  ? 'border-red-600/30 text-red-700 hover:bg-red-500/10 dark:text-red-400'
                                  : undefined
                              }
                              onClick={() => setTarget({ restaurant, action })}
                            >
                              {action === 'verify'
                                ? 'Verify'
                                : action === 'suspend'
                                  ? 'Suspend'
                                  : 'Reject'}
                            </Button>
                          ))
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {target ? (
        <RestaurantActionDialog
          restaurant={target.restaurant}
          action={target.action}
          onClose={() => setTarget(null)}
        />
      ) : null}
    </>
  );
}
