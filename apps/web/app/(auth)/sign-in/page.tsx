'use client';

import * as React from 'react';
import { useAuth, useSignIn, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, LoaderCircle, Leaf } from 'lucide-react';

import { homeForRole, type UserRole } from '@/lib/account-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

function SignInForm() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url');

  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const redirecting = React.useRef(false);

  React.useEffect(() => {
    if (isLoaded && isSignedIn && !redirecting.current) {
      redirecting.current = true;
      const userRole = user?.unsafeMetadata?.role as UserRole | undefined;
      const destination = redirectUrl || homeForRole(userRole);
      router.replace(destination);
    }
  }, [isLoaded, isSignedIn, user, redirectUrl, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const identifier = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    if (!identifier || !password) {
      setError('Please enter your email address and password.');
      return;
    }

    setPending(true);
    const { error: signInError } = await signIn.password({ identifier, password });
    setPending(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    if (signIn.status !== 'complete') {
      setError('Additional verification is required. Please try again or contact support.');
      return;
    }

    setPending(true);
    const userRole = user?.unsafeMetadata?.role as UserRole | undefined;
    const targetUrl = redirectUrl || homeForRole(userRole);
    const { error: finalizeError } = await signIn.finalize({
      navigate: ({ decorateUrl }) => {
        const url = decorateUrl(targetUrl);
        if (url.startsWith('http')) window.location.assign(url);
        else router.push(url);
      },
    });
    setPending(false);

    if (finalizeError) {
      setError(finalizeError.message);
    }
  }

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex items-center gap-2 lg:hidden">
        <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Leaf className="size-5" />
        </span>
        <span className="text-lg font-extrabold tracking-tight">Share a Plate</span>
      </div>

      <Card className="w-full border-border shadow-sm">
        <CardHeader className="space-y-1.5">
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription>Sign in to rescue or donate surplus food.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-5">
              <AlertTitle>Could not sign in</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
              {errors?.fields?.identifier ? (
                <p className="text-sm font-medium text-destructive">
                  {errors.fields.identifier.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/sign-up"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
              {errors?.fields?.password ? (
                <p className="text-sm font-medium text-destructive">
                  {errors.fields.password.message}
                </p>
              ) : null}
            </div>

            <Button type="submit" className="h-11 w-full" disabled={pending || fetchStatus === 'fetching'}>
              {pending || fetchStatus === 'fetching' ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              ) : null}
              Sign in
            </Button>
          </form>

          <Separator className="my-6" />

          <p className="text-center text-sm text-muted-foreground">
            New to Share a Plate?{' '}
            <Link href="/sign-up" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        <Link href="/" className="inline-flex items-center gap-1.5 hover:text-foreground">
          Back to home <ArrowRight className="size-3.5" />
        </Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <React.Suspense fallback={null}>
      <SignInForm />
    </React.Suspense>
  );
}
