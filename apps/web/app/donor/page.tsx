import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Leaf } from 'lucide-react';

import { getRole } from '@/lib/server/session';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function DonorPortalPage() {
  const role = await getRole('/donor');
  if (role !== 'donor') redirect('/');

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 py-8">
      <header className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="size-4" />
          </span>
          Share a Plate
        </Link>
        <Badge variant="default" className="gap-1.5">
          <LayoutDashboard className="size-3.5" /> Food Supplier
        </Badge>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center py-20 text-center">
        <h1 className="text-3xl font-extrabold tracking-[-0.02em]">Supplier portal</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Your dashboard for listing surplus food and tracking pickups is being built here.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/">Back to home</Link>
        </Button>
      </section>
    </main>
  );
}
