import type { ReactNode } from 'react';
import { Leaf, ShieldCheck, Sprout, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary-foreground/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-24 size-96 rounded-full bg-primary-foreground/10"
        />

        <Link href="/" className="relative flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <span className="grid size-9 place-items-center rounded-lg bg-primary-foreground text-primary">
            <Leaf className="size-5" />
          </span>
          Share a Plate
        </Link>

        <div className="relative max-w-md space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.04em] text-primary-foreground/80">
            Rescue · Restore · Feed
          </p>
          <h2 className="text-balance text-3xl font-extrabold leading-tight tracking-[-0.02em]">
            Surplus food from the city, delivered to the people who need it.
          </h2>
          <ul className="space-y-3 text-sm font-medium text-primary-foreground/90">
            <li className="flex items-start gap-2.5">
              <UtensilsCrossed className="mt-0.5 size-4 shrink-0" />
              Suppliers list verified, time-stamped surplus — not waste.
            </li>
            <li className="flex items-start gap-2.5">
              <Sprout className="mt-0.5 size-4 shrink-0" />
              Charities rescue real portions, not leftovers.
            </li>
            <li className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              Every pickup is confirmed with a verification code.
            </li>
          </ul>
        </div>

        <p className="relative text-xs text-primary-foreground/70">
          Built for Sri Lanka’s donors &amp; community caretakers.
        </p>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-8">{children}</main>
    </div>
  );
}
