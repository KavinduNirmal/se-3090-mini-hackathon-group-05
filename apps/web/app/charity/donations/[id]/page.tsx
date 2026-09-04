'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Leaf,
  ArrowLeft,
  Clock,
  MapPin,
  ShieldCheck,
  Building,
  Phone,
  ThermometerSun,
  AlertTriangle,
  HeartHandshake,
  CheckCircle2,
  Calendar,
  Sparkles,
  Info,
  Loader2,
  QrCode,
  Truck,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DietaryBadge, FoodListing } from '@/components/FoodCard';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/providers/authContext';

export default function DonationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const donationId = resolvedParams.id;
  const router = useRouter();
  const { user } = useAuth();

  const [donation, setDonation] = useState<FoodListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reservation form state
  const [portionsToClaim, setPortionsToClaim] = useState<number>(1);
  const [pickupEtaOption, setPickupEtaOption] = useState<string>('60'); // minutes
  const [customEta, setCustomEta] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState<{
    reservationId: string;
    verificationCode: string;
  } | null>(null);

  useEffect(() => {
    async function loadDonation() {
      setLoading(true);
      try {
        const res = await apiRequest<{ donation: FoodListing }>(
          `/api/donations/${donationId}`,
        );
        if (res.data?.donation) {
          setDonation(res.data.donation);
          setPortionsToClaim(res.data.donation.portions); // Default to claiming all available
        }
      } catch (err: any) {
        setError(err.message || 'Unable to load food donation details.');
      } finally {
        setLoading(false);
      }
    }
    loadDonation();
  }, [donationId]);

  const handlePortionPreset = (percentage: number) => {
    if (!donation) return;
    const computed = Math.max(1, Math.round((donation.portions * percentage) / 100));
    setPortionsToClaim(computed);
  };

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donation) return;
    setSubmitting(true);
    setError(null);

    try {
      // Calculate ETA timestamp
      const etaMinutes = parseInt(pickupEtaOption, 10);
      const etaDate = new Date(Date.now() + (isNaN(etaMinutes) ? 60 : etaMinutes) * 60 * 1000);

      const res = await apiRequest<{
        reservation: { id: string };
        verificationCode: string;
      }>(`/api/donations/${donation.id}/reserve`, {
        method: 'POST',
        body: JSON.stringify({
          portionsRequested: portionsToClaim,
          pickupEta: etaDate.toISOString(),
          notes: notes.trim() || undefined,
          charityName: user?.charityProfile?.orgName || 'Hope Children’s Home & Orphanage',
          charityId: user?.charityProfile?.id,
        }),
      });

      if (res.data) {
        setReservationSuccess({
          reservationId: res.data.reservation.id,
          verificationCode: res.data.verificationCode,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete reservation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="size-10 rounded-full border-3 border-emerald-600 border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-600">Loading donation details...</p>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-6 flex items-center justify-center">
        <Card className="max-w-md w-full border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center gap-2">
              <AlertTriangle className="size-5 text-red-600" />
              Listing Unavailable
            </CardTitle>
            <CardDescription className="text-slate-600">
              {error || 'This surplus food package could not be found or has expired.'}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full bg-[#15803d] hover:bg-[#166534] text-white">
              <Link href="/charity/feed">
                <ArrowLeft className="size-4 mr-2" /> Back to Rescue Feed
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Weight estimation calculation
  const claimedWeight = donation.estimatedWeightKg
    ? ((donation.estimatedWeightKg / donation.portions) * portionsToClaim).toFixed(1)
    : (portionsToClaim * 0.45).toFixed(1);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/charity/feed"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Back to Live Feed"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Food Rescue Listing</span>
              <span className="text-sm font-bold text-slate-900 line-clamp-1">{donation.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:inline-flex bg-emerald-50 text-emerald-800 border-emerald-200 text-xs">
              <ShieldCheck className="size-3.5 mr-1 text-emerald-600" /> Verified Supplier
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Success Modal / Banner */}
        {reservationSuccess && (
          <div className="mb-8 p-6 sm:p-8 bg-emerald-900 text-white rounded-2xl shadow-lg border border-emerald-700 animate-in fade-in-50 zoom-in-95">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <div className="size-16 rounded-full bg-emerald-500/20 text-emerald-300 grid place-items-center mx-auto ring-8 ring-emerald-500/10">
                <CheckCircle2 className="size-9" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Food Rescued Successfully!
              </h2>

              <p className="text-emerald-100 text-sm leading-relaxed">
                You have reserved <strong>{portionsToClaim} portions</strong> from{' '}
                <strong>{donation.donor.businessName}</strong>. Please show your pickup pass or verification code upon arrival.
              </p>

              {/* Verification Code Box */}
              <div className="my-6 p-4 rounded-xl bg-black/30 border border-emerald-500/40 inline-block">
                <span className="text-xs uppercase tracking-widest text-emerald-200 block mb-1">
                  Handover Verification PIN
                </span>
                <span className="text-3xl sm:text-4xl font-mono font-black text-amber-300 tracking-wider">
                  {reservationSuccess.verificationCode}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  asChild
                  className="bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-sm h-11 px-6 shadow-md"
                >
                  <Link href={`/charity/reservations/${reservationSuccess.reservationId}/pickup`}>
                    <QrCode className="size-4 mr-2" /> View Pickup Pass & QR Code
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-sm h-11 px-5"
                >
                  <Link href="/charity/reservations">
                    View My Reservations
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols): Food Details & Supplier Profile */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Item Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <DietaryBadge type={donation.dietaryType} />

                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <Clock className="size-3.5 text-amber-600" />
                  <span>Expires in {donation.expiryCountdownText}</span>
                </div>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {donation.title}
                </h1>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {donation.description || 'No additional preparation description provided.'}
                </p>
              </div>

              {/* Metrics Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-medium text-slate-400 block uppercase">Total Surplus</span>
                  <span className="text-lg font-bold text-slate-900">{donation.portions} Portions</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-medium text-slate-400 block uppercase">Est. Weight</span>
                  <span className="text-lg font-bold text-slate-900">~{donation.estimatedWeightKg || (donation.portions * 0.45).toFixed(1)} kg</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-medium text-slate-400 block uppercase">Distance</span>
                  <span className="text-lg font-bold text-emerald-700">{donation.distanceFormatted}</span>
                </div>
              </div>

              {/* Safe Handling & Hygiene Instructions */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-sm">
                  <ThermometerSun className="size-4 text-emerald-700" />
                  Food Handling & Hygiene Notes
                </div>
                <p className="text-emerald-800 leading-relaxed">
                  {donation.storageInstructions || 'Keep warm (>60°C) or refrigerate immediately upon shelter arrival. Serve within 4 hours.'}
                </p>
              </div>
            </div>

            {/* Donor / Kitchen Information Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Building className="size-4 text-emerald-700" />
                  Food Donor Details
                </h3>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  {donation.donor.donorType}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-base font-bold text-slate-900 block">
                    {donation.donor.businessName}
                  </span>
                  <span className="text-xs text-slate-500">
                    Kitchen Contact: {donation.donor.contactPerson}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <MapPin className="size-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Pickup Address</span>
                      <span className="font-semibold text-slate-800">{donation.pickupAddress}, {donation.city}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Phone className="size-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Direct Phone</span>
                      <a href={`tel:${donation.contactNumber}`} className="font-semibold text-emerald-700 hover:underline">
                        {donation.contactNumber}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(donation.pickupAddress + ', ' + donation.city)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    <ExternalLink className="size-3.5" /> Open Location in Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Interactive Claim Form */}
          <div className="lg:col-span-5 sticky top-24">
            <Card className="border-2 border-emerald-600/30 shadow-md bg-white rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-800 to-[#15803d] text-white p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-white/20 text-white border-none text-[11px] font-bold">
                    <HeartHandshake className="size-3 mr-1" /> Claim Form
                  </Badge>
                  <span className="text-xs text-emerald-100">100% Free Rescue</span>
                </div>
                <CardTitle className="text-xl font-extrabold text-white mt-2">
                  Reserve for Your Shelter
                </CardTitle>
                <CardDescription className="text-xs text-emerald-100">
                  Select portion quantity and your estimated collection time.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleReserve}>
                <CardContent className="p-5 sm:p-6 space-y-5">
                  {error && (
                    <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200 py-2.5">
                      <AlertTriangle className="size-4 text-red-600" />
                      <AlertTitle className="text-xs font-bold">Error</AlertTitle>
                      <AlertDescription className="text-xs">{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Portion Slider / Quantity */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="portions" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Portions to Claim
                      </Label>
                      <span className="text-xs font-semibold text-slate-500">
                        Max: {donation.portions} portions
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Input
                        id="portions"
                        type="number"
                        min="1"
                        max={donation.portions}
                        value={portionsToClaim}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val)) {
                            setPortionsToClaim(Math.min(donation.portions, Math.max(1, val)));
                          }
                        }}
                        className="h-12 text-center text-xl font-extrabold text-[#15803d] w-28 focus-visible:ring-emerald-600"
                      />

                      <div className="flex-1">
                        <input
                          type="range"
                          min="1"
                          max={donation.portions}
                          value={portionsToClaim}
                          onChange={(e) => setPortionsToClaim(parseInt(e.target.value, 10))}
                          className="w-full accent-[#15803d] cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-0.5">
                          <span>1</span>
                          <span>{Math.round(donation.portions / 2)}</span>
                          <span>{donation.portions}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {[
                        { label: '25%', val: 25 },
                        { label: '50%', val: 50 },
                        { label: '75%', val: 75 },
                        { label: 'All', val: 100 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handlePortionPreset(preset.val)}
                          className="py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors text-center"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                      <span>Estimated Food Weight:</span>
                      <strong className="text-slate-900 font-bold">~{claimedWeight} kg</strong>
                    </div>
                  </div>

                  {/* Pickup ETA Window */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Truck className="size-3.5 text-slate-500" /> Estimated Pickup Time
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: '30 Mins', value: '30' },
                        { label: '1 Hour', value: '60' },
                        { label: '2 Hours', value: '120' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setPickupEtaOption(opt.value)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                            pickupEtaOption === opt.value
                              ? 'bg-emerald-50 border-[#15803d] text-[#15803d] ring-1 ring-[#15803d]'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional Notes */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <Label htmlFor="notes" className="text-xs font-semibold text-slate-700">
                      Collection Notes <span className="text-slate-400 font-normal">(Optional)</span>
                    </Label>
                    <Input
                      id="notes"
                      placeholder="e.g. Bringing 2 insulated containers & van"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="h-10 text-xs focus-visible:ring-emerald-600"
                    />
                  </div>

                  {/* Carbon / Impact Callout */}
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                    <Sparkles className="size-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Claiming this surplus prevents approximately{' '}
                      <strong>{(parseFloat(claimedWeight) * 2.5).toFixed(1)} kg of CO₂e</strong> emissions.
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="bg-slate-50/70 border-t border-slate-100 p-5 sm:p-6">
                  <Button
                    type="submit"
                    disabled={submitting || !!reservationSuccess}
                    className="w-full bg-[#15803d] hover:bg-[#166534] text-white h-12 font-bold text-sm shadow-sm transition-all"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Generating Reservation Pass...
                      </>
                    ) : (
                      <>
                        <HeartHandshake className="mr-2 size-5" />
                        Confirm Reservation for Shelter
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
