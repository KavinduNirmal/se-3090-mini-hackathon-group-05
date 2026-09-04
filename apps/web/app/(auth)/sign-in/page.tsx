'use client';

import * as React from 'react';
import { useAuth, useSignIn, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, KeyRound, LoaderCircle, Leaf } from 'lucide-react';

import { isUserRole, resolvePostAuthDestination, type UserRole } from '@/lib/account-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

function roleFromUser(user: { unsafeMetadata?: unknown; publicMetadata?: unknown } | null | undefined): UserRole | null {
  const unsafe = (user?.unsafeMetadata ?? {}) as { role?: unknown };
  const pub = (user?.publicMetadata ?? {}) as { role?: unknown };
  const role = unsafe.role ?? pub.role;
  return isUserRole(role) ? role : null;
}

const PREFERRED_MFA = ['totp', 'backup_code', 'phone_code', 'email_code'];

function mfaStrategyLabel(strategy: string): string {
  if (strategy === 'totp') return 'Authenticator app';
  if (strategy === 'backup_code') return 'Backup code';
  if (strategy === 'phone_code') return 'Text message code';
  if (strategy === 'email_code') return 'Email code';
  return strategy;
}

function needsMfaSend(strategy: string): boolean {
  return strategy === 'phone_code' || strategy === 'email_code';
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
  const [stage, setStage] = React.useState<'credentials' | 'mfa'>('credentials');
  const [mfaStrategies, setMfaStrategies] = React.useState<string[]>([]);
  const [mfaStrategy, setMfaStrategy] = React.useState('');
  const [mfaCode, setMfaCode] = React.useState('');
  const [mfaSent, setMfaSent] = React.useState(false);
  const [mfaBusy, setMfaBusy] = React.useState(false);

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
      case 'form_code_incorrect':
        return 'That code is incorrect. Please check it and try again.';
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

  function startMfa() {
    const factors = (signIn.supportedSecondFactors ?? []).map((factor) => factor.strategy);
    if (factors.length === 0) {
      setError('Sign-in could not be completed. Please try again or contact support.');
      return;
    }
    const preferred =
      PREFERRED_MFA.find((strategy) => (factors as string[]).includes(strategy)) ?? factors[0];
    setMfaStrategies(factors);
    setMfaStrategy(preferred);
    setMfaCode('');
    setMfaSent(false);
    setStage('mfa');
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
    //    exactly that instead of a misleading error.
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
      // 4a. The account has a second factor enabled — hand over to the MFA step.
      const secondFactors = signIn.supportedSecondFactors ?? [];
      if (secondFactors.length > 0) {
        startMfa();
        return;
      }
      setError('Sign-in could not be completed. Please try again or contact support.');
      return;
    }

    // 4b. Activate the created session; the effect above routes the user to
    //     their destination once the user loads.
    await signIn.finalize({ navigate: () => {} });
    setPending(false);
  }

  async function sendMfaCode() {
    setError(null);
    setMfaBusy(true);
    const { error: sendError } =
      mfaStrategy === 'phone_code'
        ? await signIn.mfa.sendPhoneCode()
        : await signIn.mfa.sendEmailCode();
    setMfaBusy(false);
    if (sendError) {
      setError(friendlyError(sendError));
      return;
    }
    setMfaSent(true);
  }

  async function submitMfa() {
    if (!mfaCode.trim()) return;
    setError(null);
    setMfaBusy(true);

    const verify =
      mfaStrategy === 'totp'
        ? signIn.mfa.verifyTOTP
        : mfaStrategy === 'backup_code'
          ? signIn.mfa.verifyBackupCode
          : mfaStrategy === 'phone_code'
            ? signIn.mfa.verifyPhoneCode
            : signIn.mfa.verifyEmailCode;

    const { error: verifyError } = await verify({ code: mfaCode.trim() });
    if (verifyError) {
      setMfaBusy(false);
      setError(friendlyError(verifyError));
      return;
    }

    if (signIn.status !== 'complete') {
      setMfaBusy(false);
      setError('Verification could not be completed. Please try again.');
      return;
    }

    await signIn.finalize({ navigate: () => {} });
    setMfaBusy(false);
    setStage('credentials');
  }

  async function backToCredentials() {
    await signIn.reset();
    setError(null);
    setStage('credentials');
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
          <CardDescription>
            {stage === 'mfa'
              ? 'One more step to confirm it’s you.'
              : 'Sign in to rescue or donate surplus food.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-5">
              <AlertTitle>Could not sign in</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {stage === 'credentials' ? (
            <>
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

                <Button
                  type="submit"
                  className="h-11 w-full"
                  disabled={pending || fetchStatus === 'fetching'}
                >
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
            </>
          ) : (
            <div className="space-y-4">
              <button
                type="button"
                onClick={backToCredentials}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" /> Change account
              </button>

              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                    <KeyRound className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground">Two-step verification</p>
                    <p className="text-xs text-muted-foreground">
                      Enter the code to finish signing in.
                    </p>
                  </div>
                </div>

                {mfaStrategies.length > 1 ? (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {mfaStrategies.map((strategy) => (
                      <button
                        key={strategy}
                        type="button"
                        onClick={() => {
                          setMfaStrategy(strategy);
                          setMfaCode('');
                          setMfaSent(false);
                          setError(null);
                        }}
                        className={cn(
                          'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                          strategy === mfaStrategy
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:bg-muted',
                        )}
                      >
                        {mfaStrategyLabel(strategy)}
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="mt-4 space-y-1.5">
                  <Label htmlFor="mfa-code" className="font-semibold">
                    {mfaStrategyLabel(mfaStrategy)} code
                  </Label>
                  {needsMfaSend(mfaStrategy) && !mfaSent ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mb-2"
                      disabled={mfaBusy}
                      onClick={sendMfaCode}
                    >
                      {mfaBusy ? (
                        <LoaderCircle className="mr-2 size-3.5 animate-spin" />
                      ) : null}
                      Send code
                    </Button>
                  ) : null}
                  {needsMfaSend(mfaStrategy) && mfaSent ? (
                    <p className="mb-2 text-xs text-muted-foreground">
                      A code was sent to your {mfaStrategy === 'phone_code' ? 'phone' : 'email'}.{' '}
                      <button
                        type="button"
                        className="font-semibold text-primary hover:underline"
                        disabled={mfaBusy}
                        onClick={sendMfaCode}
                      >
                        Resend
                      </button>
                    </p>
                  ) : null}
                  <Input
                    id="mfa-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    placeholder={mfaStrategy === 'backup_code' ? 'XXXXX-XXXXX' : '••••••'}
                    className="bg-background"
                  />
                </div>

                <Button
                  type="button"
                  className="mt-4 h-10 w-full"
                  disabled={!mfaCode.trim() || mfaBusy}
                  onClick={submitMfa}
                >
                  {mfaBusy ? (
                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                  ) : (
                    <KeyRound className="mr-2 size-4" />
                  )}
                  Verify &amp; sign in
                </Button>
              </div>
            </div>
          )}
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
