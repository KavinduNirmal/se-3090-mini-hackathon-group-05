import Link from 'next/link';
import { Leaf, ShieldCheck } from 'lucide-react';

import { AuthNav } from '@/components/auth-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 py-8">
      <header className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="size-4" />
          </span>
          Share a Plate
        </Link>
        <div className="flex items-center gap-3">
          <Badge variant="default" className="gap-1.5">
            <ShieldCheck className="size-3.5" /> Admin
          </Badge>
          <AuthNav />
        </div>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center py-20 text-center">
        <h1 className="text-3xl font-extrabold tracking-[-0.02em]">Admin dashboard</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Impact analytics, restaurant &amp; charity verification, and donation monitoring will be
          built here.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/">Back to home</Link>
        </Button>
      </section>
    </main>
  );
}
