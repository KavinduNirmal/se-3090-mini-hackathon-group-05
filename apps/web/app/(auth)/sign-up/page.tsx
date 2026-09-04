'use client';

import * as React from 'react';
import { useAuth, useSignUp, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, HeartHandshake, Leaf, LoaderCircle, Store } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ACCOUNT_TYPES, ACCOUNT_TYPE_LIST, homeForRole, isUserRole, type UserRole } from '@/lib/account-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

type Step = 'role' | 'details' | 'verify';

const ROLE_META: Record<
  UserRole,
  { icon: React.ComponentType<{ className?: string }>; tone: 'primary' | 'secondary' }
> = {
  donor: { icon: Store, tone: 'primary' },
  charity: { icon: HeartHandshake, tone: 'secondary' },
};

function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const prefillRole = searchParams.get('role');

  const [step, setStep] = React.useState<Step>(() =>
    isUserRole(prefillRole) ? 'details' : 'role',
  );
  const [role, setRole] = React.useState<UserRole | null>(
    isUserRole(prefillRole) ? prefillRole : null,
  );
  const [orgName, setOrgName] = React.useState('');
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [verifySent, setVerifySent] = React.useState(false);

  React.useEffect(() => {
    if (isLoaded && isSignedIn) {
      const activeRole = (user?.unsafeMetadata?.role || role) as UserRole | undefined;
      const targetHome = homeForRole(activeRole);
      router.replace(targetHome);
    }
  }, [isLoaded, isSignedIn, user, role, router]);

  const activeType = role ? ACCOUNT_TYPES[role] : null;

  async function handleSubmitDetails(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get('firstName') ?? '').trim();
    const lastName = String(formData.get('lastName') ?? '').trim();
    const emailAddress = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const organization = String(formData.get('organization') ?? '').trim();
    setOrgName(organization);

    if (!role) {
      setError('Please choose an account type first.');
      return;
    }

    setPending(true);
    const { error: passwordError } = await signUp.password({
      emailAddress,
      password,
      firstName,
      lastName,
      unsafeMetadata: {
        role,
        orgName: organization,
      },
    });
    setPending(false);

    if (passwordError) {
      setError(passwordError.message);
      return;
    }

    if (signUp.status === 'complete') {
      await finalize();
      return;
    }

    if (signUp.isTransferable) {
      setError('An account with this email already exists. Please sign in instead.');
      return;
    }

    if (signUp.unverifiedFields.includes('email_address')) {
      setVerifySent(false);
      setStep('verify');
      return;
    }

    setError(
      'Some additional details are still required. Please go back and review your information.',
    );
  }

  async function sendVerificationCode() {
    setPending(true);
    await signUp.verifications.sendEmailCode();
    setPending(false);
    setVerifySent(true);
  }

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const code = String(formData.get('code') ?? '').trim();

    if (!code) {
      setError('Please enter the verification code sent to your email.');
      return;
    }

    setPending(true);
    const { error: verifyError } = await signUp.verifications.verifyEmailCode({ code });
    setPending(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    if (signUp.status === 'complete') {
      await finalize();
    }
  }

  async function finalize() {
    setPending(true);
    const { error: finalizeError } = await signUp.finalize({
      navigate: ({ decorateUrl }) => {
        const url = decorateUrl(homeForRole(role));
        if (url.startsWith('http')) window.location.assign(url);
        else router.push(url);
      },
    });
    setPending(false);

    if (finalizeError) {
      setError(finalizeError.message);
    }
  }

  function goBack() {
    setError(null);
    if (step === 'details') {
      setStep('role');
      return;
    }
    if (step === 'verify') {
      setStep('details');
      return;
    }
    router.push('/');
  }

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="w-full max-w-lg">
      <div className="mb-8 flex items-center gap-2 lg:hidden">
        <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Leaf className="size-5" />
        </span>
        <span className="text-lg font-extrabold tracking-tight">Share a Plate</span>
      </div>

      {step === 'role' ? (
        <Card className="w-full border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">Join Share a Plate</CardTitle>
            <CardDescription>Choose how you want to take part in food rescue.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {ACCOUNT_TYPE_LIST.map((account) => {
                const meta = ROLE_META[account.role];
                const Icon = meta.icon;
                const selected = role === account.role;
                return (
                  <button
                    key={account.role}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setError(null);
                      setRole(account.role);
                    }}
                    className={cn(
                      'group relative flex items-start gap-4 rounded-lg border p-4 text-left transition-colors',
                      selected
                        ? meta.tone === 'primary'
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-secondary bg-secondary/5 ring-1 ring-secondary'
                        : 'border-border bg-card hover:border-primary/50 hover:bg-muted/40',
                    )}
                  >
                    <span
                      className={cn(
                        'grid size-11 shrink-0 place-items-center rounded-md',
                        selected
                          ? meta.tone === 'primary'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground'
                          : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary',
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-base font-bold">{account.label}</span>
                        {selected ? (
                          <Badge
                            variant={meta.tone === 'primary' ? 'default' : 'secondary'}
                            className="gap-1 px-1.5"
                          >
                            <Check className="size-3" /> Selected
                          </Badge>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">
                        {account.headline}
                      </span>
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        {account.examples.map((example) => (
                          <Badge key={example} variant="outline" className="font-medium">
                            {example}
                          </Badge>
                        ))}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <Separator className="my-6" />

            <Button
              type="button"
              className="h-11 w-full"
              disabled={!role}
              onClick={() => {
                setError(null);
                setStep('details');
              }}
            >
              Continue
              <ArrowRight className="ml-2 size-4" />
            </Button>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/sign-in" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      ) : null}

      {step === 'details' && activeType ? (
        <Card className="w-full border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <Badge
                variant={activeType.role === 'donor' ? 'default' : 'secondary'}
                className="px-2 py-0.5"
              >
                {activeType.label}
              </Badge>
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" /> Change
              </button>
            </div>
            <CardTitle className="mt-3 text-2xl font-bold tracking-tight">
              Create your account
            </CardTitle>
            <CardDescription>{activeType.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <Alert variant="destructive" className="mb-5">
                <AlertTitle>We couldn’t create your account</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <form className="space-y-4" onSubmit={handleSubmitDetails}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" name="firstName" autoComplete="given-name" required />
                  {errors?.fields?.firstName ? (
                    <p className="text-sm font-medium text-destructive">
                      {errors.fields.firstName.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" name="lastName" autoComplete="family-name" required />
                  {errors?.fields?.lastName ? (
                    <p className="text-sm font-medium text-destructive">
                      {errors.fields.lastName.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">{activeType.orgLabel}</Label>
                <Input
                  id="organization"
                  name="organization"
                  placeholder={activeType.orgPlaceholder}
                />
              </div>

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
                {errors?.fields?.emailAddress ? (
                  <p className="text-sm font-medium text-destructive">
                    {errors.fields.emailAddress.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
                {errors?.fields?.password ? (
                  <p className="text-sm font-medium text-destructive">
                    {errors.fields.password.message}
                  </p>
                ) : null}
              </div>

              <div id="clerk-captcha" />

              <Button
                type="submit"
                className="h-11 w-full"
                disabled={pending || fetchStatus === 'fetching'}
              >
                {pending || fetchStatus === 'fetching' ? (
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                ) : null}
                Create account
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {step === 'verify' ? (
        <Card className="w-full border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant={activeType?.role === 'donor' ? 'default' : 'secondary'}>
                {activeType?.label ?? 'Account'}
              </Badge>
            </div>
            <CardTitle className="mt-3 text-2xl font-bold tracking-tight">
              Verify your email
            </CardTitle>
            <CardDescription>
              We sent a 6-digit verification code to your inbox. Enter it below to finish creating
              your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <Alert variant="destructive" className="mb-5">
                <AlertTitle>Verification failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            {!verifySent ? (
              <Button
                type="button"
                className="h-11 w-full"
                disabled={pending}
                onClick={() => void sendVerificationCode()}
              >
                {pending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
                Send verification code
              </Button>
            ) : (
              <form className="space-y-4" onSubmit={handleVerify}>
                <div className="space-y-2">
                  <Label htmlFor="code">Verification code</Label>
                  <Input
                    id="code"
                    name="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                  {errors?.fields?.code ? (
                    <p className="text-sm font-medium text-destructive">
                      {errors.fields.code.message}
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
                  Verify &amp; create account
                </Button>

                <button
                  type="button"
                  disabled={pending}
                  onClick={() => void sendVerificationCode()}
                  className="mx-auto block text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                >
                  Resend code
                </button>
              </form>
            )}

            <Separator className="my-6" />

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" /> Back
              </button>
              <p className="text-muted-foreground">
                Wrong email?{' '}
                <Link href="/sign-up" className="font-semibold text-primary hover:underline">
                  Start over
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        By creating an account you agree to Share a Plate’s Terms &amp; Food Safety guidelines.
      </p>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <React.Suspense fallback={null}>
      <SignUpScreen />
    </React.Suspense>
  );
}
