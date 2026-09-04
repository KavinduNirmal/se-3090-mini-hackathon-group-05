'use client';

import * as React from 'react';
import { useAuth, useSignIn, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, LoaderCircle, Leaf } from 'lucide-react';

import { isUserRole, resolvePostAuthDestination, type UserRole } from '@/lib/account-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

function roleFromUser(user: { unsafeMetadata?: unknown; publicMetadata?: unknown } | null | undefined): UserRole | null {
  const unsafe = (user?.unsafeMetadata ?? {}) as { role?: unknown };
  const pub = (user?.publicMetadata ?? {}) as { role?: unknown };
  const role = unsafe.role ?? pub.role;
  return isUserRole(role) ? role : null;
}

function SignInForm() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const { isLoaded, isSignedIn } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url');
  const role = roleFromUser(user);

  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const redirecting = React.useRef(false);

  // Route users to the page they originally requested, or to their role home.
  React.useEffect(() => {
    if (!isLoaded || !userLoaded || !isSignedIn || redirecting.current) return;
    redirecting.current = true;
    router.replace(resolvePostAuthDestination(redirectUrl, role));
  }, [isLoaded, userLoaded, isSignedIn, role, redirectUrl, router]);

  function friendlyError(err: { code?: string; message?: string } | null | undefined): string {
    switch (err?.code) {
      case 'form_identifier_not_found':
        return 'No account exists for this email on Share a Plate. Double-check the address or create an account first.';
      case 'form_password_incorrect':
        return 'Incorrect password. Please try again.';
      default:
        return err?.message ?? 'Something went wrong. Please try again.';
    }
  }

  function strategyLabel(strategy: string): string {
    if (strategy === 'oauth_google') return 'Google';
    if (strategy === 'password') return 'password';
    if (strategy === 'ticket') return 'email magic link';
    return strategy;
  }

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

    // 1. Start a sign-in attempt for the identifier so we can see which
    //    first-factor strategies the Clerk application actually offers.
    const { error: createError } = await signIn.create({ identifier });
    if (createError) {
      setPending(false);
      setError(friendlyError(createError));
      return;
    }

    // 2. If this Clerk app has not enabled password sign-in, tell the user
    //    exactly that instead of a misleading "additional verification" error.
    const factors = signIn.supportedFirstFactors ?? [];
    const hasPasswordFactor = factors.some((factor) => factor.strategy === 'password');
    if (!hasPasswordFactor) {
      setPending(false);
      const options =
        factors.length > 0
          ? factors.map((factor) => strategyLabel(factor.strategy)).join(', ')
          : 'none';
      setError(
        `Password sign-in is not enabled on this account's app (available sign-in methods: ${options}). ` +
          'Enable “Email + Password” under Clerk → User & Authentication, or use Google to sign in.',
      );
      return;
    }

    // 3. Submit the password for the sign-in that create() already set up.
    const { error: passwordError } = await signIn.password({ password });
    if (passwordError) {
      setPending(false);
      setError(friendlyError(passwordError));
      return;
    }

    if (signIn.status !== 'complete') {
      setPending(false);
      const mfa =
        (signIn.supportedSecondFactors?.length ?? 0) > 0
          ? ' Two-factor verification is required for this account.'
          : '';
      setError(`Sign-in could not be completed.${mfa} Please try again or contact support.`);
      return;
    }

    // 4. Activate the created session without leaving the page; the effect
    //    above routes the user to their destination once the user loads.
    await signIn.finalize({ navigate: () => {} });
    setPending(false);
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
