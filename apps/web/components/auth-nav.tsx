'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserButton, useAuth, useClerk } from '@clerk/nextjs';
import { LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function AuthNav() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return (
      <nav className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/sign-up">Get started</Link>
        </Button>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-2">
      <UserButton />
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground"
        onClick={() => signOut(() => router.push('/'))}
      >
        <LogOut className="size-4" />
        Log out
      </Button>
    </nav>
  );
}
