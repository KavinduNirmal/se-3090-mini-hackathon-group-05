'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  Eye,
  Flag,
  LoaderCircle,
  MapPin,
  Package,
  ShieldCheck,
  Store,
  Trash2,
  Utensils,
  Weight,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import type { AdminDonation } from '@/lib/server/admin';
import { StatusBadge } from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function DonationsTable({ donations }: { donations: AdminDonation[] }) {
  const router = useRouter();
  const { getToken } = useAuth();

  const [viewing, setViewing] = React.useState<AdminDonation | null>(null);
  const [flagTarget, setFlagTarget] = React.useState<AdminDonation | null>(null);
  const [flagReason, setFlagReason] = React.useState('');
  const [removeTarget, setRemoveTarget] = React.useState<AdminDonation | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);

  async function post(path: string, body?: Record<string, unknown>) {
    const token = await getToken();
    const res = await fetch(`${API_BASE_URL}/api/admin${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body ?? {}),
    });
    const parsed = await res.json().catch(() => null);
    if (!res.ok || parsed?.status !== 'success') {
      throw new Error(parsed?.message || `Request failed (${res.status})`);
    }
  }

  async function submitFlag() {
    if (!flagTarget) return;
    setBusy(flagTarget.id);
    try {
      await post(`/donations/${flagTarget.id}/flag`, { reason: flagReason.trim() });
      toast.success('Listing flagged', { description: flagTarget.title });
      setFlagTarget(null);
      setFlagReason('');
      router.refresh();
    } catch (err) {
      toast.error('Could not flag listing', {
        description: err instanceof Error ? err.message : 'Unexpected error',
      });
    } finally {
      setBusy(null);
    }
  }

  async function submitRemove() {
    if (!removeTarget) return;
    setBusy(removeTarget.id);
    try {
      await post(`/donations/${removeTarget.id}/remove`);
      toast.success('Listing removed', { description: removeTarget.title });
      setRemoveTarget(null);
      router.refresh();
    } catch (err) {
      toast.error('Could not remove listing', {
        description: err instanceof Error ? err.message : 'Unexpected error',
      });
    } finally {
      setBusy(null);
    }
  }

  if (donations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <Package className="size-6" />
        </span>
        <h3 className="mt-4 font-bold text-foreground">No donations found</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          No food listings match the current filter.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Listing</th>
                <th className="px-4 py-3">Donor</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Pickup expiry</th>
                <th className="px-4 py-3">Flag</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {donations.map((donation) => (
                <tr key={donation.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Utensils className="size-4.5" />
                      </span>
                      <div className="min-w-0 max-w-xs">
                        <p className="truncate font-bold text-foreground">{donation.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{donation.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="flex items-center gap-1.5 font-medium text-foreground">
                      <Store className="size-3.5 text-muted-foreground" />
                      <span className="truncate">{donation.donorName}</span>
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-foreground tabular">
                      {donation.portions} portions
                    </p>
                    <p className="text-xs text-muted-foreground tabular">{donation.weightKg} kg</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={donation.status} />
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground tabular">
                    {formatWhen(donation.expiryTime)}
                  </td>
                  <td className="px-4 py-3.5">
                    {donation.flagged ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-600/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                        <Flag className="size-3" /> Flagged
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-muted-foreground hover:text-foreground"
                        onClick={() => setViewing(donation)}
                      >
                        <Eye className="size-3.5" /> View
                      </Button>
                      {donation.status !== 'removed' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-secondary hover:text-secondary"
                            onClick={() => {
                              setFlagReason(donation.flagReason ?? '');
                              setFlagTarget(donation);
                            }}
                          >
                            <Flag className="size-3.5" /> Flag
                          </Button>
                          {donation.status !== 'collected' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-red-600 hover:text-red-600 dark:text-red-400"
                              onClick={() => setRemoveTarget(donation)}
                            >
                              <Trash2 className="size-3.5" /> Remove
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- View details modal ---- */}
      {viewing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setViewing(null)}
          />
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-border bg-muted/40 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <Utensils className="size-5" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-foreground">{viewing.title}</h2>
                    {viewing.flagged && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-600/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                        <Flag className="size-3" /> Flagged
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {viewing.donorName} · {viewing.category}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewing(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto px-6 py-5 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={viewing.status} />
                {viewing.flagReason ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-600/30 bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:text-red-400">
                    <AlertTriangle className="size-3" /> {viewing.flagReason}
                  </span>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-border bg-background p-3">
                  <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Utensils className="size-3" /> Portions
                  </span>
                  <p className="mt-1 text-lg font-extrabold text-foreground tabular">
                    {viewing.portions}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background p-3">
                  <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Weight className="size-3" /> Weight
                  </span>
                  <p className="mt-1 text-lg font-extrabold text-foreground tabular">
                    {viewing.weightKg} kg
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background p-3">
                  <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <CalendarClock className="size-3" /> Expires
                  </span>
                  <p className="mt-1 text-xs font-bold text-foreground tabular">
                    {formatWhen(viewing.expiryTime)}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background p-3">
                  <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <ShieldCheck className="size-3" /> Handling
                  </span>
                  <p className="mt-1 text-xs font-bold text-foreground">{viewing.temperature ?? '—'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-2 rounded-xl border border-border bg-background p-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Pickup location
                    </span>
                    <p className="mt-0.5 font-medium text-foreground">{viewing.pickupAddress}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {viewing.pickupNotes ?? 'No pickup notes'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-xl border border-border bg-background p-3">
                  <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Contact
                    </span>
                    <p className="mt-0.5 font-medium text-foreground tabular">{viewing.contactNumber}</p>
                    {viewing.claimedByCharity?.name ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Rescued by{' '}
                        <span className="font-semibold text-foreground">
                          {viewing.claimedByCharity.name}
                        </span>
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border bg-muted/20 px-6 py-4">
              <span className="text-xs text-muted-foreground">
                Listed {formatWhen(viewing.createdAt)}
              </span>
              <Button variant="outline" onClick={() => setViewing(null)}>
                Close details
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ---- Flag modal ---- */}
      {flagTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setFlagTarget(null)}
          />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4">
              <h2 className="flex items-center gap-2 font-bold text-foreground">
                <Flag className="size-4 text-secondary" /> Flag suspicious listing
              </h2>
              <button
                onClick={() => setFlagTarget(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <p className="text-sm text-muted-foreground">
                Flagging <span className="font-semibold text-foreground">{flagTarget.title}</span>{' '}
                marks it for operations review and surfaces it to monitoring.
              </p>
              <div className="space-y-2">
                <Label htmlFor="flag-reason" className="font-semibold">
                  Reason
                </Label>
                <Textarea
                  id="flag-reason"
                  rows={3}
                  placeholder="e.g. Duplicate listing, suspicious quantities, safety concern…"
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/20 px-6 py-4">
              <Button variant="outline" onClick={() => setFlagTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                disabled={busy === flagTarget.id}
                onClick={submitFlag}
                className="font-semibold text-white"
              >
                {busy === flagTarget.id ? (
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                ) : (
                  <Flag className="mr-2 size-4" />
                )}
                Flag listing
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ---- Remove confirm modal ---- */}
      {removeTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setRemoveTarget(null)}
          />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4">
              <h2 className="flex items-center gap-2 font-bold text-foreground">
                <AlertTriangle className="size-4 text-red-600 dark:text-red-400" />
                Remove invalid listing
              </h2>
              <button
                onClick={() => setRemoveTarget(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="space-y-3 px-6 py-5 text-sm">
              <p className="text-foreground">
                Remove <span className="font-bold">{removeTarget.title}</span> from the platform?
              </p>
              <p className="text-muted-foreground">
                The listing will be marked as <span className="font-semibold">removed</span> and
                will no longer appear in rescue feeds or monitoring.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/20 px-6 py-4">
              <Button variant="outline" onClick={() => setRemoveTarget(null)}>
                Cancel
              </Button>
              <Button
                className="gap-1.5 bg-red-600 font-semibold text-white hover:bg-red-700"
                disabled={busy === removeTarget.id}
                onClick={submitRemove}
              >
                {busy === removeTarget.id ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                Remove listing
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
