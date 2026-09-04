import Link from 'next/link';
import { ArrowRight, HeartHandshake, Leaf, ShieldCheck, Sprout, Store } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const stats = [
  { value: '12,400', label: 'Portions rescued' },
  { value: '340', label: 'Partner suppliers' },
  { value: '52', label: 'Verified charities' },
  { value: '4.1 t', label: 'CO₂e prevented' },
];

export default function HomePage() {
  return (
    <main className="min-h-dvh">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="size-5" />
          </span>
          Share a Plate
        </Link>
        <nav className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/sign-up">Get started</Link>
          </Button>
        </nav>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 pb-20 pt-10 lg:grid-cols-2 lg:items-center lg:pt-16">
        <div>
          <Badge variant="outline" className="mb-5 gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-800">
            <Sprout className="size-3.5" /> Surplus food rescue · Sri Lanka
          </Badge>
          <h1 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
            Don&apos;t throw it away.{' '}
            <span className="text-primary">Share the plate.</span>
          </h1>
          <p className="mt-5 max-w-md text-pretty text-lg text-muted-foreground">
            Share a Plate connects restaurants, bakeries and hotels with verified children&apos;s
            homes, shelters and charities — so today&apos;s surplus becomes someone&apos;s meal
            tonight.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Button asChild size="lg" className="h-12 justify-between px-5">
              <Link href="/sign-up?role=donor">
                <span className="flex items-center gap-2">
                  <Store className="size-5" />
                  I&apos;m a food supplier
                </span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="h-12 justify-between px-5"
            >
              <Link href="/sign-up?role=charity">
                <span className="flex items-center gap-2">
                  <HeartHandshake className="size-5" />
                  I&apos;m a charity
                </span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-6 border-t border-border pt-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-extrabold tracking-tight text-primary tabular">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-emerald-100 via-amber-50 to-transparent"
          />
          <div className="space-y-3">
            {[
              {
                icon: Store,
                tone: 'text-primary',
                bg: 'bg-primary/10',
                title: 'Supplier lists surplus',
                body: 'Portions, dietary tags and a real pickup window — not leftovers.',
              },
              {
                icon: Sprout,
                tone: 'text-emerald-600',
                bg: 'bg-emerald-100',
                title: 'Charity reserves nearby',
                body: 'A live rescue feed with expiry countdowns and distance.',
              },
              {
                icon: ShieldCheck,
                tone: 'text-secondary',
                bg: 'bg-secondary/10',
                title: 'Pickup is verified',
                body: 'Confirmation code closes the loop on every rescue.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
                >
                  <span className={`grid size-11 shrink-0 place-items-center rounded-lg ${item.bg} ${item.tone}`}>
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="font-bold">{item.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{item.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
