'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Leaf, HeartHandshake, Radio, ArrowLeft, RefreshCw, AlertCircle, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FoodCard, FoodListing } from '@/components/FoodCard';
import { FeedFilterBar } from '@/components/FeedFilterBar';
import { apiRequest } from '@/lib/api';

export default function CharityFeedPage() {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [totalPortions, setTotalPortions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    search: '',
    city: 'ALL',
    dietary: 'ALL',
    category: 'ALL',
  });

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.city !== 'ALL') params.append('city', filters.city);
      if (filters.dietary !== 'ALL') params.append('dietary', filters.dietary);
      if (filters.category !== 'ALL') params.append('category', filters.category);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await apiRequest<{
        listings: FoodListing[];
        totalCount: number;
        totalPortionsAvailable: number;
      }>(`/api/donations/feed${queryString}`);

      if (res.data) {
        setListings(res.data.listings || []);
        setTotalPortions(res.data.totalPortionsAvailable || 0);
      }
    } catch (err: any) {
      console.error('Failed to fetch food rescue feed:', err);
      setError(err.message || 'Unable to connect to live feed. Please retry.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFeed();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchFeed]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      city: 'ALL',
      dietary: 'ALL',
      category: 'ALL',
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/charity/dashboard"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
              <span className="grid size-9 place-items-center rounded-xl bg-[#15803d] text-white shadow-sm">
                <Leaf className="size-5" />
              </span>
              <span className="text-lg font-bold text-slate-900">Share a Plate</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{totalPortions} Portions Ready for Rescue</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchFeed}
              disabled={loading}
              className="text-xs h-9 px-3 text-slate-600 hover:text-slate-900"
            >
              <RefreshCw className={`size-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-1">
              <Radio className="size-3 text-amber-600 animate-pulse" /> Live Rescue Feed
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Available Surplus Food Nearby
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Select and claim surplus food packages from verified hotels, restaurants, and bakeries.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <FeedFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
          totalCount={listings.length}
        />

        {/* Listings Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
            <div className="size-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Scanning for surplus food near you...</p>
          </div>
        ) : error ? (
          <div className="py-16 bg-red-50/50 border border-red-200 rounded-2xl p-6 text-center space-y-3 max-w-md mx-auto">
            <AlertCircle className="size-8 text-red-600 mx-auto" />
            <p className="text-sm font-semibold text-red-900">{error}</p>
            <Button size="sm" onClick={fetchFeed} className="bg-red-700 hover:bg-red-800 text-white text-xs">
              Try Again
            </Button>
          </div>
        ) : listings.length === 0 ? (
          <div className="py-20 bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
            <div className="size-12 rounded-full bg-slate-100 grid place-items-center mx-auto text-slate-400">
              <UtensilsCrossed className="size-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No surplus listings match your filters</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try resetting your dietary or city filters to view all available listings in the greater area.
            </p>
            <Button size="sm" variant="outline" onClick={handleResetFilters} className="text-xs mt-2">
              Reset All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
