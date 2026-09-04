'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  HeartHandshake,
  Package,
  BarChart3,
  Trophy,
  FileText,
  Leaf,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';

interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  match?: string;
}

const NAV_ITEMS: AdminNavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/restaurants', label: 'Restaurants', icon: Store, match: '/admin/restaurants' },
  { href: '/admin/charities', label: 'Charities', icon: HeartHandshake, match: '/admin/charities' },
  { href: '/admin/donations', label: 'Donations', icon: Package, match: '/admin/donations' },
  { href: '/admin/impact', label: 'Impact', icon: BarChart3, match: '/admin/impact' },
  { href: '/admin/leaderboard', label: 'Leaderboard', icon: Trophy, match: '/admin/leaderboard' },
  { href: '/admin/reports', label: 'Reports', icon: FileText, match: '/admin/reports' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-center gap-2.5 border-b border-border px-3 lg:justify-start lg:px-5">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-2.5 font-extrabold tracking-tight"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="size-5" />
          </span>
          <span className="hidden lg:block">
            <span className="block text-sm leading-tight">Share a Plate</span>
            <span className="block text-[11px] font-semibold text-primary">Admin Console</span>
          </span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2 lg:p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = item.match ? pathname.startsWith(item.match) : pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              title={item.label}
              className={cn(
                'group flex items-center justify-center gap-3 rounded-lg px-2 py-2.5 text-sm font-semibold transition-colors lg:justify-start lg:px-3',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon
                className={cn(
                  'size-5 shrink-0',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                )}
              />
              <span className="hidden lg:block lg:truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 px-2 py-2 lg:justify-start">
          <ShieldCheck className="size-4 shrink-0 text-primary" />
          <span className="hidden text-xs font-bold uppercase tracking-wider text-primary lg:block">
            Team Admin
          </span>
        </div>
      </div>
    </div>
  );
}
