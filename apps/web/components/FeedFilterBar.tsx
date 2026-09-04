'use client';

import React from 'react';
import { Search, MapPin, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FilterState {
  search: string;
  city: string;
  dietary: string;
  category: string;
}

interface FeedFilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  totalCount: number;
}

const CITIES = [
  { value: 'ALL', label: 'All Locations' },
  { value: 'Colombo', label: 'Colombo (All Areas)' },
  { value: 'Colombo 02', label: 'Colombo 02 (Slave Island)' },
  { value: 'Colombo 03', label: 'Colombo 03 (Kollupitiya)' },
  { value: 'Colombo 05', label: 'Colombo 05 (Havelock Town)' },
  { value: 'Colombo 07', label: 'Colombo 07 (Cinnamon Gardens)' },
  { value: 'Kandy', label: 'Kandy' },
  { value: 'Gampaha', label: 'Gampaha' },
];

const DIETARY_OPTIONS = [
  { value: 'ALL', label: 'All Diets' },
  { value: 'PURE_VEG', label: '🌱 Pure Veg' },
  { value: 'HALAL', label: '🌙 Halal' },
  { value: 'NON_VEG', label: '🍗 Non-Veg' },
];

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'All Categories' },
  { value: 'COOKED_MEALS', label: '🍲 Cooked Meals' },
  { value: 'RICE_CURRY', label: '🍛 Rice & Curry' },
  { value: 'BAKERY_PASTRIES', label: '🥐 Bakery & Buns' },
  { value: 'PACKAGED_FOOD', label: '📦 Packaged' },
];

export function FeedFilterBar({
  filters,
  onFilterChange,
  onReset,
  totalCount,
}: FeedFilterBarProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Top Search & Location Dropdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Search by food name, hotel, or bakery..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="pl-10 h-10 text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
          />
        </div>

        {/* City Filter */}
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <select
            value={filters.city}
            onChange={(e) => onFilterChange({ ...filters, city: e.target.value })}
            className="w-full pl-10 pr-4 h-10 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            {CITIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="size-3" /> Diet:
          </span>

          {DIETARY_OPTIONS.map((opt) => {
            const active = filters.dietary === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onFilterChange({ ...filters, dietary: opt.value })}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-[#15803d] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
            Type:
          </span>

          {CATEGORY_OPTIONS.map((opt) => {
            const active = filters.category === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onFilterChange({ ...filters, category: opt.value })}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-[#d97706] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Reset Action */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-xs font-bold text-slate-700">
            {totalCount} {totalCount === 1 ? 'Rescue' : 'Rescues'} Available
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 px-2.5 text-xs text-slate-500 hover:text-slate-800"
          >
            <RotateCcw className="size-3 mr-1" /> Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
