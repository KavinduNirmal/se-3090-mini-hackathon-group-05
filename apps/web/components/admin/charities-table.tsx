'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import {
  Building2,
  CheckCircle2,
  Eye,
  HeartHandshake,
  LoaderCircle,
  MapPin,
  Phone,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import type { AdminCharity } from '@/lib/server/admin';
import { StatusBadge } from '@/components/admin/status-badge';
import { SortableTh, type SortDir } from '@/components/admin/sortable-th';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const CHARITY_SORTS: Record<string, (charity: AdminCharity) => string | number> = {
  name: (c) => c.name.toLowerCase(),
  registrationNo: (c) => (c.registrationNo ?? '').toLowerCase(),
  status: (c) => c.status,
  verified: (c) => (c.verified ? 1 : 0),
  createdAt: (c) => c.createdAt,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function CharitiesTable({ charities }: { charities: AdminCharity[] }) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [review, setReview] = React.useState<AdminCharity | null>(null);
  const [busy, setBusy] = React.useState<{ id: string; action: string } | null>(null);
  const [sortKey, setSortKey] = React.useState('createdAt');
  const [sortDir, setSortDir] = React.useState<SortDir>('desc');

  const sorted = React.useMemo(() => {
    const arr = [...charities];
    const get = CHARITY_SORTS[sortKey] ?? CHARITY_SORTS.createdAt;
    arr.sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      if (va < vb) return -1;
      if (va > vb) return 1;
      return 0;
    });
    return sortDir === 'asc' ? arr : arr.reverse();
  }, [charities, sortKey, sortDir]);

  function requestSort(key: string) {
    setSortKey(key);
    setSortDir((dir) => (sortKey === key && dir === 'asc' ? 'desc' : 'asc'));
  }

  async function runAction(charity: AdminCharity, action: 'verify' | 'reject') {
    setBusy({ id: charity.id, action });
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/charities/${charity.id}`, {
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
      toast.success(action === 'verify' ? 'Charity verified' : 'Charity rejected', {
        description: charity.name,
      });
      setReview(null);
      router.refresh();
    } catch (err) {
      toast.error('Action failed', {
        description: err instanceof Error ? err.message : 'Unexpected error',
      });
    } finally {
      setBusy(null);
    }
  }

  if (charities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <HeartHandshake className="size-6" />
        </span>
        <h3 className="mt-4 font-bold text-foreground">No charities found</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          No organizations match the current filters.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <SortableTh
                  label="Organization"
                  sortKey="name"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={requestSort}
                  className="px-5"
                />
                <SortableTh
                  label="Registration no."
                  sortKey="registrationNo"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={requestSort}
                />
                <SortableTh
                  label="Status"
                  sortKey="status"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={requestSort}
                />
                <SortableTh
                  label="Verified"
                  sortKey="verified"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={requestSort}
                />
                <SortableTh
                  label="Registered"
                  sortKey="createdAt"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={requestSort}
                />
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map((charity) => (
                <tr key={charity.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Building2 className="size-4.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-foreground">{charity.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {charity.type}
                          {charity.city ? ` · ${charity.city}` : ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-medium tabular text-muted-foreground">
                    {charity.registrationNo ?? '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={charity.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    {charity.verified ? (
                      <Badge variant="outline" className="gap-1 border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        <ShieldCheck className="size-3" /> Verified
                      </Badge>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">
                        Not verified
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground tabular">
                    {formatDate(charity.createdAt)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReview(charity)}
                        className="gap-1.5"
                      >
                        <Eye className="size-3.5" /> Review
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {review ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setReview(null)}
          />
          <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-border bg-muted/40 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <Building2 className="size-5" />
                </span>
                <div>
                  <h2 className="font-bold text-foreground">{review.name}</h2>
                  <div className="mt-0.5 flex items-center gap-2">
                    <StatusBadge status={review.status} />
                    {review.verified && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        <ShieldCheck className="size-3" /> Verified org
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setReview(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5 text-sm">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-background p-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Organization type
                  </span>
                  <p className="mt-1 font-semibold text-foreground">{review.type}</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Registration no.
                  </span>
                  <p className="mt-1 font-semibold text-foreground tabular">
                    {review.registrationNo ?? 'Not provided'}
                  </p>
                </div>
                <div className="flex items-start gap-2 rounded-xl border border-border bg-background p-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Address
                    </span>
                    <p className="mt-0.5 font-medium text-foreground">
                      {review.address ?? 'Not provided'}
                      {review.city ? `, ${review.city}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-xl border border-border bg-background p-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Contact
                    </span>
                    <p className="mt-0.5 font-medium text-foreground tabular">
                      {review.phone ?? 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Member of Share a Plate since {formatDate(review.createdAt)}. Verification confirms
                the organization operates as a registered community food partner before it can
                reserve donations.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border bg-muted/20 px-6 py-4">
              <Button variant="outline" onClick={() => setReview(null)}>
                Close
              </Button>
              {(review.status === 'pending' || review.status === 'active') && (
                <Button
                  variant="outline"
                  className="gap-1.5 border-red-600/30 text-red-700 hover:bg-red-500/10 dark:text-red-400"
                  disabled={busy?.id === review.id}
                  onClick={() => runAction(review, 'reject')}
                >
                  {busy?.id === review.id && busy.action === 'reject' ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <XCircle className="size-4" />
                  )}
                  Reject
                </Button>
              )}
              {review.status === 'pending' && (
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  disabled={busy?.id === review.id}
                  onClick={() => runAction(review, 'verify')}
                >
                  {busy?.id === review.id && busy.action === 'verify' ? (
                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 size-4" />
                  )}
                  Verify organization
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
