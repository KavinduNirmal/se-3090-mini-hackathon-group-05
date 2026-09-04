'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Leaf, HeartHandshake, MapPin, Users, Utensils, Clock, CheckCircle2, ShieldCheck, LogOut, ArrowRight, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/authContext';

export default function CharityDashboardPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading Charity Portal...</p>
        </div>
      </div>
    );
  }

  const charityProfile = user?.charityProfile;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/charity/dashboard" className="flex items-center gap-2 font-extrabold tracking-tight">
            <span className="grid size-9 place-items-center rounded-xl bg-[#15803d] text-white shadow-sm">
              <Leaf className="size-5" />
            </span>
            <span className="text-lg font-bold text-slate-900">Share a Plate</span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-800 border-emerald-200 hidden sm:inline-flex gap-1.5 py-1 px-2.5">
              <HeartHandshake className="size-3.5 text-emerald-600" />
              {charityProfile?.orgName || 'Verified Charity'}
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-xs font-medium text-slate-600 hover:text-red-600 hover:border-red-200"
            >
              <LogOut className="size-3.5 mr-1.5" /> Sign Out
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome Banner */}
        <section className="bg-gradient-to-r from-emerald-800 to-[#15803d] rounded-2xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold backdrop-blur-sm">
              <ShieldCheck className="size-3.5" /> Charity Partner Cockpit
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {charityProfile?.orgName || 'Charity Partner'}!
            </h1>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Real-time surplus food claims are ready in your area. Check live food postings from partner hotels, bakeries, and restaurants.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Button asChild className="bg-[#d97706] hover:bg-[#b45309] text-white font-semibold text-xs shadow-sm h-9 px-4">
                <Link href="/charity/feed">
                  <Radio className="size-3.5 mr-1.5 animate-pulse" /> Live Rescue Feed
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-semibold text-xs h-9 px-4">
                <Link href="/charity/reservations">
                  My Reservations
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs text-slate-500 font-medium">Available Surplus Nearby</CardDescription>
              <CardTitle className="text-2xl font-extrabold text-slate-900 flex items-center justify-between">
                <span>14 Listings</span>
                <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm">
                  <Utensils className="size-4" />
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-500">
              Within 5km radius
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs text-slate-500 font-medium">Active Reservations</CardDescription>
              <CardTitle className="text-2xl font-extrabold text-slate-900 flex items-center justify-between">
                <span>2 Pending</span>
                <span className="p-2 rounded-lg bg-amber-50 text-amber-700 text-sm">
                  <Clock className="size-4" />
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-amber-700 font-medium">
              Ready for pickup today
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs text-slate-500 font-medium">Completed Rescues</CardDescription>
              <CardTitle className="text-2xl font-extrabold text-slate-900 flex items-center justify-between">
                <span>28 Claims</span>
                <span className="p-2 rounded-lg bg-blue-50 text-blue-700 text-sm">
                  <CheckCircle2 className="size-4" />
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-500">
              100% verified handovers
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs text-slate-500 font-medium">Meals Received</CardDescription>
              <CardTitle className="text-2xl font-extrabold text-[#15803d] flex items-center justify-between">
                <span>490 Portions</span>
                <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm">
                  <HeartHandshake className="size-4" />
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-emerald-700 font-medium">
              Distributed to beneficiaries
            </CardContent>
          </Card>
        </section>

        {/* Profile Card */}
        {charityProfile && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
              Registered Organization Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Organization Name</span>
                <span className="font-semibold text-slate-800 text-sm">{charityProfile.orgName}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Category</span>
                <span className="font-semibold text-slate-800 text-sm">{charityProfile.charityType}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Primary Contact</span>
                <span className="font-semibold text-slate-800 text-sm">{charityProfile.contactPerson} ({charityProfile.phone})</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1 flex items-center gap-1">
                  <MapPin className="size-3 text-slate-400" /> Pickup Location
                </span>
                <span className="font-semibold text-slate-800 text-sm">{charityProfile.address}, {charityProfile.city}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1 flex items-center gap-1">
                  <Users className="size-3 text-slate-400" /> Beneficiary Count
                </span>
                <span className="font-semibold text-slate-800 text-sm">{charityProfile.beneficiaryCount || 'Not specified'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Registration Status</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 text-sm">
                  <CheckCircle2 className="size-3.5" /> Active & Operational
                </span>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
