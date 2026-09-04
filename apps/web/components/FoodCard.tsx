'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, MapPin, ShieldCheck, HeartHandshake, ArrowRight, AlertTriangle, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface FoodListing {
  id: string;
  title: string;
  description?: string;
  category: string;
  dietaryType: 'PURE_VEG' | 'NON_VEG' | 'HALAL' | 'VEGAN';
  portions: number;
  estimatedWeightKg?: number;
  preparedTime: string;
  expiryTime: string;
  expiryCountdownText: string;
  isUrgent: boolean;
  pickupAddress: string;
  city: string;
  district?: string;
  contactNumber: string;
  storageInstructions?: string;
  status: string;
  distanceKm: number;
  distanceFormatted: string;
  donor: {
    businessName: string;
    donorType: string;
    contactPerson: string;
    phone: string;
    address: string;
    city: string;
    isVerified: boolean;
    hygieneCertified: boolean;
  };
}

export function DietaryBadge({ type }: { type: FoodListing['dietaryType'] }) {
  switch (type) {
    case 'HALAL':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#059669]/10 text-[#047857] border border-[#059669]/30">
          <span className="size-1.5 rounded-full bg-[#047857]" />
          Halal Certified
        </span>
      );
    case 'PURE_VEG':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#15803d]/10 text-[#15803d] border border-[#15803d]/30">
          <span className="size-1.5 rounded-sm bg-[#15803d]" />
          Pure Vegetarian
        </span>
      );
    case 'NON_VEG':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#dc2626]/10 text-[#991b1b] border border-[#dc2626]/30">
          <span className="size-1.5 rotate-45 bg-[#b91c1c]" />
          Non-Vegetarian
        </span>
      );
    case 'VEGAN':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#84cc16]/15 text-[#3f6212] border border-[#84cc16]/30">
          <span className="size-1.5 rounded-full bg-[#65a30d]" />
          100% Vegan
        </span>
      );
    default:
      return null;
  }
}

export function FoodCard({ item }: { item: FoodListing }) {
  return (
    <div className="group relative bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Header: Donor & Distance */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800 line-clamp-1">
                {item.donor.businessName}
              </span>
              {item.donor.isVerified && (
                <ShieldCheck className="size-4 text-[#15803d] shrink-0" title="Verified Food Supplier" />
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <MapPin className="size-3 text-slate-400 shrink-0" />
              <span>{item.distanceFormatted}</span>
            </div>
          </div>

          {/* Urgency Badge */}
          {item.isUrgent ? (
            <Badge variant="secondary" className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold px-2 py-0.5 animate-pulse shrink-0">
              Urgent Pickup
            </Badge>
          ) : (
            <Badge variant="outline" className="text-emerald-800 bg-emerald-50 border-emerald-200 text-[10px] font-semibold px-2 py-0.5 shrink-0">
              Available
            </Badge>
          )}
        </div>

        {/* Title & Quantity */}
        <h3 className="text-base font-bold text-slate-900 tracking-tight mb-2 group-hover:text-[#15803d] transition-colors line-clamp-2">
          {item.title}
        </h3>

        {item.description && (
          <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Dietary Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <DietaryBadge type={item.dietaryType} />
          {item.estimatedWeightKg && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
              ~{item.estimatedWeightKg} kg
            </span>
          )}
        </div>
      </div>

      {/* Bottom Footer: Timer & Action */}
      <div className="pt-3 border-t border-slate-100 mt-auto">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs">
            <Clock className={`size-3.5 ${item.isUrgent ? 'text-amber-600' : 'text-slate-400'}`} />
            <span className={`font-semibold tabular ${item.isUrgent ? 'text-amber-700' : 'text-slate-600'}`}>
              Expires in {item.expiryCountdownText}
            </span>
          </div>

          <span className="text-xs font-bold text-[#15803d]">
            {item.portions} Portions
          </span>
        </div>

        <Button
          asChild
          className="w-full h-10 bg-[#15803d] hover:bg-[#166534] text-white font-semibold text-xs shadow-sm justify-between px-4 transition-all"
        >
          <Link href={`/charity/donations/${item.id}`}>
            <span>Claim for Shelter</span>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
