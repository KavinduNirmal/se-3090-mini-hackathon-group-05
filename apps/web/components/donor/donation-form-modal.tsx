'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Flame,
  Utensils,
  Clock,
  Scale,
  ShieldCheck,
  MapPin,
  Sparkles,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export interface NewDonationData {
  title: string;
  category: string;
  portions: number;
  weightKg: number;
  dietary: ('halal' | 'pure-veg' | 'non-veg')[];
  temperature: string;
  expiresInHours: number;
  pickupNotes: string;
}

interface DonationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewDonationData) => void;
}

export function DonationFormModal({ isOpen, onClose, onSubmit }: DonationFormModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Prepared Meals');
  const [portions, setPortions] = useState(40);
  const [weightKg, setWeightKg] = useState(15);
  const [dietary, setDietary] = useState<('halal' | 'pure-veg' | 'non-veg')[]>(['halal', 'non-veg']);
  const [temperature, setTemperature] = useState('Hot-Held (>60°C)');
  const [expiresInHours, setExpiresInHours] = useState(2);
  const [pickupNotes, setPickupNotes] = useState('Loading Dock 2, Ground Floor Service Bay. Ask for Head Chef Ranil.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleDietary = (item: 'halal' | 'pure-veg' | 'non-veg') => {
    if (dietary.includes(item)) {
      setDietary(dietary.filter((d) => d !== item));
    } else {
      setDietary([...dietary, item]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a descriptive food title');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit({
        title: title.trim(),
        category,
        portions: Number(portions),
        weightKg: Number(weightKg),
        dietary,
        temperature,
        expiresInHours: Number(expiresInHours),
        pickupNotes: pickupNotes.trim(),
      });
      setIsSubmitting(false);
      toast.success('Food donation listing published successfully!', {
        description: 'Verified community partners have been notified for immediate pickup.',
      });
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Scrim Overlay per DESIGN.md elevation-3 */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl rounded-2xl bg-card border border-border shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <Plus className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Create Food Donation
              </h2>
              <p className="text-xs text-muted-foreground">
                List surplus meals for rapid rescue by verified shelters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6 text-sm">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="food-title" className="font-semibold">
              Food Listing Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="food-title"
              placeholder="e.g. Freshly Prepared Basmati Rice & Chicken Curry"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background"
              required
            />
          </div>

          {/* Grid Category & Temperature */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="font-semibold">Food Category</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:ring-2 focus:ring-primary focus:outline-hidden"
              >
                <option value="Prepared Meals">Prepared Meals & Buffets</option>
                <option value="Bakery & Pastry">Bakery & Pastry Items</option>
                <option value="Fresh Produce">Fresh Produce & Fruits</option>
                <option value="Dairy & Beverages">Dairy & Refreshing Drinks</option>
                <option value="Dry Groceries">Dry Groceries & Staples</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold">Hygiene & Safety Handling</Label>
              <select
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus:ring-2 focus:ring-primary focus:outline-hidden"
              >
                <option value="Hot-Held (>60°C)">Hot-Held Chafing (&gt;60°C)</option>
                <option value="Refrigerated (<4°C)">Refrigerated Sealed (&lt;4°C)</option>
                <option value="Room Temp (<2h)">Ambient Fresh (&lt;2h)</option>
                <option value="Thermal Sealed Box">Thermal Insulated Sealed Box</option>
              </select>
            </div>
          </div>

          {/* Quantity & Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="portions-count" className="font-semibold flex items-center gap-1.5">
                <Utensils className="size-3.5 text-primary" /> Portions Count
              </Label>
              <Input
                id="portions-count"
                type="number"
                min={1}
                max={1000}
                value={portions}
                onChange={(e) => setPortions(Number(e.target.value))}
                className="bg-background tabular"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="weight-kg" className="font-semibold flex items-center gap-1.5">
                <Scale className="size-3.5 text-[#84cc16]" /> Estimated Weight (kg)
              </Label>
              <Input
                id="weight-kg"
                type="number"
                step="0.5"
                min={0.5}
                max={500}
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="bg-background tabular"
              />
            </div>
          </div>

          {/* Dietary Compliance Selection */}
          <div className="space-y-2 pt-1">
            <Label className="font-semibold">Dietary Certifications</Label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => toggleDietary('halal')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  dietary.includes('halal')
                    ? 'border-[#059669] bg-[#059669]/15 text-[#047857]'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted'
                }`}
              >
                {dietary.includes('halal') && <Check className="size-3" />}
                Halal Certified
              </button>

              <button
                type="button"
                onClick={() => toggleDietary('pure-veg')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  dietary.includes('pure-veg')
                    ? 'border-[#16a34a] bg-[#16a34a]/15 text-[#15803d]'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted'
                }`}
              >
                {dietary.includes('pure-veg') && <Check className="size-3" />}
                Pure Vegetarian
              </button>

              <button
                type="button"
                onClick={() => toggleDietary('non-veg')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  dietary.includes('non-veg')
                    ? 'border-[#dc2626] bg-[#dc2626]/15 text-[#991b1b]'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted'
                }`}
              >
                {dietary.includes('non-veg') && <Check className="size-3" />}
                Non-Vegetarian
              </button>
            </div>
          </div>

          {/* Expiry Window */}
          <div className="space-y-1.5">
            <Label className="font-semibold flex items-center gap-1.5">
              <Clock className="size-3.5 text-secondary" /> Pickup Window / Expiry
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 4, 8].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setExpiresInHours(hours)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                    expiresInHours === hours
                      ? 'border-secondary bg-secondary/10 text-secondary font-bold ring-1 ring-secondary'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {hours} {hours === 1 ? 'Hour' : 'Hours'}
                </button>
              ))}
            </div>
          </div>

          {/* Pickup Instructions */}
          <div className="space-y-1.5">
            <Label htmlFor="pickup-notes" className="font-semibold flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary" /> Pickup Location Instructions
            </Label>
            <Input
              id="pickup-notes"
              value={pickupNotes}
              onChange={(e) => setPickupNotes(e.target.value)}
              placeholder="e.g. Back entrance, ask security for Kitchen Staff"
              className="bg-background"
            />
          </div>

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold min-w-32"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="size-4 animate-spin" /> Publishing...
                </span>
              ) : (
                'Publish Listing'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
