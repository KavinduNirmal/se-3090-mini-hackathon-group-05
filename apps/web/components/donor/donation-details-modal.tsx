'use client';

import React from 'react';
import {
  X,
  Clock,
  MapPin,
  ShieldCheck,
  Building2,
  QrCode,
  CheckCircle2,
  Flame,
  Utensils,
  Scale,
  Thermometer,
  Calendar,
  Edit3,
} from 'lucide-react';
import { DietaryBadge } from './dietary-badge';
import { Button } from '@/components/ui/button';

export interface FoodListing {
  id: string;
  title: string;
  category: string;
  portions: number;
  weightKg: number;
  dietary: string[];
  status: 'active' | 'claimed' | 'collected' | 'expired' | 'available' | 'reserved';
  createdAt: string;
  expiresAt: string;
  temperature: string;
  pickupNotes: string;
  pickupAddress?: string;
  contactNumber?: string;
  claimedByCharity?: {
    name: string;
    type: string;
    verified: boolean;
    contactName: string;
    phone: string;
  };
  pickupQrCode?: string;
}

interface DonationDetailsModalProps {
  listing: FoodListing | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkCollected?: (id: string) => void;
  onEdit?: (listing: FoodListing) => void;
}

export function DonationDetailsModal({
  listing,
  isOpen,
  onClose,
  onMarkCollected,
  onEdit,
}: DonationDetailsModalProps) {
  if (!isOpen || !listing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Scrim Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card Surface (DESIGN.md elevation-3) */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-card border border-border shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Banner */}
        <div className="border-b border-border bg-muted/40 px-6 py-5 flex items-start justify-between">
          <div className="space-y-1 pr-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                {listing.category}
              </span>
              {listing.status === 'active' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full dark:text-amber-400">
                  <Flame className="size-3" /> Live Active Pickup
                </span>
              )}
              {listing.status === 'claimed' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 rounded-full dark:text-blue-400">
                  <Clock className="size-3" /> Claimed — In Transit
                </span>
              )}
              {listing.status === 'collected' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full dark:text-emerald-400">
                  <CheckCircle2 className="size-3" /> Rescued & Collected
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground pt-1">
              {listing.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Details Grid */}
        <div className="p-6 space-y-6 text-sm">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-muted/60 border border-border/60">
              <span className="text-xs text-muted-foreground block font-medium">Portions</span>
              <div className="flex items-center gap-1.5 mt-1 font-bold text-lg text-foreground tabular">
                <Utensils className="size-4 text-primary" /> {listing.portions}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/60 border border-border/60">
              <span className="text-xs text-muted-foreground block font-medium">Weight</span>
              <div className="flex items-center gap-1.5 mt-1 font-bold text-lg text-foreground tabular">
                <Scale className="size-4 text-[#84cc16]" /> {listing.weightKg} kg
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/60 border border-border/60">
              <span className="text-xs text-muted-foreground block font-medium">Safety Standard</span>
              <div className="flex items-center gap-1.5 mt-1 font-semibold text-xs text-foreground">
                <Thermometer className="size-4 text-secondary shrink-0" />
                <span className="truncate">{listing.temperature}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/60 border border-border/60">
              <span className="text-xs text-muted-foreground block font-medium">Pickup Deadline</span>
              <div className="flex items-center gap-1.5 mt-1 font-bold text-xs text-secondary tabular">
                <Clock className="size-4 shrink-0" /> {listing.expiresAt}
              </div>
            </div>
          </div>

          {/* Dietary Compliance */}
          <div className="space-y-2">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              Dietary & Hygiene Certifications
            </h4>
            <div className="flex flex-wrap gap-2">
              {listing.dietary.map((tag) => (
                <DietaryBadge key={tag} type={tag} />
              ))}
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="size-3.5" /> 5-Star Hygiene Certified
              </span>
            </div>
          </div>

          {/* Recipient Charity Info (If claimed or collected) */}
          {listing.claimedByCharity && (
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                    <Building2 className="size-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">
                      {listing.claimedByCharity.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {listing.claimedByCharity.type} • Verified Rescue Partner
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  Verified Org
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-primary/10">
                <div>
                  <span className="text-muted-foreground">Contact Dispatcher:</span>{' '}
                  <span className="font-semibold text-foreground">
                    {listing.claimedByCharity.contactName}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone Direct:</span>{' '}
                  <span className="font-semibold text-foreground tabular">
                    {listing.claimedByCharity.phone}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pickup Instructions & Dispatch QR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border pt-4">
            <div className="sm:col-span-2 space-y-2">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MapPin className="size-3.5 text-primary" /> Pickup Location Instructions
              </h4>
              <p className="text-sm bg-muted/40 p-3 rounded-lg border border-border text-foreground">
                {listing.pickupNotes}
              </p>
            </div>

            {/* QR Verification Placeholder */}
            <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-border bg-background text-center">
              <div className="size-20 bg-muted/60 rounded-lg border border-border flex items-center justify-center mb-1 text-foreground">
                <QrCode className="size-14 text-primary" />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">
                Pickup Verification QR
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4 bg-muted/20">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="size-3.5" /> Published {listing.createdAt}
          </span>
          <div className="flex items-center gap-3">
            {onEdit && (
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  onEdit(listing);
                }}
                className="gap-1.5 border-primary/30 hover:bg-primary/10 text-primary font-semibold text-xs h-9 px-3.5"
              >
                <Edit3 className="size-3.5" /> Edit Details
              </Button>
            )}
            {listing.status === 'claimed' && onMarkCollected && (
              <Button
                onClick={() => {
                  onMarkCollected(listing.id);
                  onClose();
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                Mark Handed Over / Collected
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
