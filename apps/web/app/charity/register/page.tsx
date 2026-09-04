'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Leaf,
  HeartHandshake,
  Building2,
  MapPin,
  Lock,
  Users,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Truck,
  Refrigerator,
  Info,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/providers/authContext';

const CHARITY_CATEGORIES = [
  { value: 'ORPHANAGE', label: "👶 Children's Home / Orphanage" },
  { value: 'ELDER_CARE', label: '🧓 Elderly Care Facility' },
  { value: 'COMMUNITY_KITCHEN', label: '🍲 Community Kitchen / Soup Kitchen' },
  { value: 'SHELTER', label: '🏠 Emergency Shelter / Safe Home' },
  { value: 'NGO_HUB', label: '📦 Non-Profit Distribution Hub' },
  { value: 'OTHER', label: '🤝 Community Welfare Initiative' },
];

const DISTRICTS = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Galle',
  'Matara',
  'Kurunegala',
  'Jaffna',
  'Anuradhapura',
  'Badulla',
  'Ratnapura',
  'Other',
];

const TRANSPORT_OPTIONS = [
  'Organization Van / Vehicle',
  'Volunteers with Cars / Bikes',
  'Three-Wheeler / Tuk Tuk Dispatch',
  'On-Foot / Walking Distance Only',
];

export default function CharityRegisterPage() {
  const router = useRouter();
  const { registerCharity } = useAuth();

  const [formData, setFormData] = useState({
    orgName: '',
    charityType: 'ORPHANAGE' as const,
    regNumber: '',
    beneficiaryCount: '',
    hasRefrigeration: true,
    transportMode: 'Organization Van / Vehicle',
    dietaryNotes: '',
    contactPerson: '',
    contactDesignation: 'Director / Superintendent',
    phone: '',
    alternatePhone: '',
    address: '',
    city: '',
    district: 'Colombo',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form Validations
    if (!formData.orgName.trim()) {
      setError('Please provide the name of the children’s home, shelter, or organization.');
      return;
    }
    if (!formData.contactPerson.trim()) {
      setError('Please provide the primary contact person / caretaker name.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Please provide a direct mobile or landline phone number.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please provide a valid official email address.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify your password entry.');
      return;
    }
    if (!formData.address.trim() || !formData.city.trim()) {
      setError('Please provide the complete address and city.');
      return;
    }

    setLoading(true);

    try {
      await registerCharity({
        role: 'CHARITY',
        email: formData.email.trim(),
        password: formData.password,
        orgName: formData.orgName.trim(),
        charityType: formData.charityType,
        regNumber: formData.regNumber.trim() || undefined,
        contactPerson: `${formData.contactPerson.trim()} (${formData.contactDesignation})`,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        district: formData.district,
        beneficiaryCount: formData.beneficiaryCount
          ? parseInt(formData.beneficiaryCount, 10)
          : undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/charity/dashboard');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Top Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <span className="grid size-10 place-items-center rounded-xl bg-[#15803d] text-white shadow-sm transition-transform group-hover:scale-105">
              <Leaf className="size-5" />
            </span>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              Share a Plate
            </span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
            <HeartHandshake className="size-3.5 text-emerald-700" />
            Charity & Community Caretaker Registration
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Register a Children&apos;s Home or Charity
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-xl">
            Register your shelter, children&apos;s home, elder care home, or soup kitchen to claim verified surplus meals from local hotels, bakeries, and restaurants in Sri Lanka.
          </p>
        </div>

        {/* Main Card Form */}
        <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-50/70 border-b border-slate-100 px-6 sm:px-8 py-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="size-5 text-[#15803d]" />
                Charity Facility Onboarding
              </CardTitle>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="size-3" /> 100% Free
              </span>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Complete this form to receive notifications of available surplus food nearby.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="px-6 sm:px-8 py-6 space-y-6">
              {error && (
                <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200">
                  <AlertCircle className="size-4 text-red-600" />
                  <AlertTitle className="text-sm font-semibold">Please check your details</AlertTitle>
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-emerald-50 text-emerald-900 border-emerald-200">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <AlertTitle className="text-sm font-semibold">Registration Successful!</AlertTitle>
                  <AlertDescription className="text-xs">
                    Your facility is registered. Redirecting to your dashboard...
                  </AlertDescription>
                </Alert>
              )}

              {/* Section 1: Home / Organization Identity */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                  <span className="flex size-5 items-center justify-center rounded-full bg-[#15803d] text-white text-xs font-bold">1</span>
                  <h2 className="text-sm font-bold text-slate-800">Facility & Organization Profile</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="orgName" className="text-xs font-semibold text-slate-700">
                      Facility / Organization Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="orgName"
                      name="orgName"
                      placeholder="e.g. St. Vincent Children's Home / Vajira Elder Care"
                      value={formData.orgName}
                      onChange={handleChange}
                      required
                      className="h-10 text-sm focus-visible:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="charityType" className="text-xs font-semibold text-slate-700">
                      Facility Category <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="charityType"
                      name="charityType"
                      value={formData.charityType}
                      onChange={handleChange}
                      className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      {CHARITY_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="regNumber" className="text-xs font-semibold text-slate-700">
                      NGO / Trust / Social Services Reg No. <span className="text-slate-400 font-normal">(Optional)</span>
                    </Label>
                    <Input
                      id="regNumber"
                      name="regNumber"
                      placeholder="e.g. NGO-GA-2022/410"
                      value={formData.regNumber}
                      onChange={handleChange}
                      className="h-10 text-sm focus-visible:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="beneficiaryCount" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <Users className="size-3.5 text-slate-500" /> Beneficiaries / Residents Count
                    </Label>
                    <Input
                      id="beneficiaryCount"
                      name="beneficiaryCount"
                      type="number"
                      min="1"
                      placeholder="e.g. 45 children / 60 residents"
                      value={formData.beneficiaryCount}
                      onChange={handleChange}
                      className="h-10 text-sm focus-visible:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="transportMode" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <Truck className="size-3.5 text-slate-500" /> Collection Capability
                    </Label>
                    <select
                      id="transportMode"
                      name="transportMode"
                      value={formData.transportMode}
                      onChange={handleChange}
                      className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      {TRANSPORT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      name="hasRefrigeration"
                      checked={formData.hasRefrigeration}
                      onChange={handleChange}
                      className="size-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <Refrigerator className="size-4 text-emerald-700" />
                    <span>We have cold storage / refrigerator available on premise for rescued meals.</span>
                  </label>
                </div>
              </div>

              {/* Section 2: Contact & Location */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                  <span className="flex size-5 items-center justify-center rounded-full bg-[#15803d] text-white text-xs font-bold">2</span>
                  <h2 className="text-sm font-bold text-slate-800">Caretaker Contact & Address</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="contactPerson" className="text-xs font-semibold text-slate-700">
                      Primary Contact Person / Caretaker <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contactPerson"
                      name="contactPerson"
                      placeholder="e.g. Sister Teresa / Rev. K. Fernando"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      required
                      className="h-10 text-sm focus-visible:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contactDesignation" className="text-xs font-semibold text-slate-700">
                      Role / Designation
                    </Label>
                    <Input
                      id="contactDesignation"
                      name="contactDesignation"
                      placeholder="e.g. Matron, Caretaker, Director"
                      value={formData.contactDesignation}
                      onChange={handleChange}
                      className="h-10 text-sm focus-visible:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                      Primary Phone Number (Calls/SMS) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="e.g. 077 123 4567"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="h-10 text-sm focus-visible:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="alternatePhone" className="text-xs font-semibold text-slate-700">
                      Alternate Phone / WhatsApp <span className="text-slate-400 font-normal">(Optional)</span>
                    </Label>
                    <Input
                      id="alternatePhone"
                      name="alternatePhone"
                      type="tel"
                      placeholder="e.g. 011 234 5678"
                      value={formData.alternatePhone}
                      onChange={handleChange}
                      className="h-10 text-sm focus-visible:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="address" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <MapPin className="size-3.5 text-slate-500" /> Physical Facility Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="e.g. 120 Sri Sambuddhatva Jayanthi Mawatha"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="h-10 text-sm focus-visible:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs font-semibold text-slate-700">
                      City / Area <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="e.g. Colombo 05 / Havelock Town"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="h-10 text-sm focus-visible:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="district" className="text-xs font-semibold text-slate-700">
                      District <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      {DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Account Credentials */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                  <span className="flex size-5 items-center justify-center rounded-full bg-[#15803d] text-white text-xs font-bold">3</span>
                  <h2 className="text-sm font-bold text-slate-800">Account Credentials</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                      Official Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="care@childrenshome.org"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="h-10 text-sm focus-visible:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <Lock className="size-3.5 text-slate-500" /> Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="h-10 text-sm focus-visible:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700">
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="h-10 text-sm focus-visible:ring-emerald-600"
                    />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-slate-50/70 border-t border-slate-100 px-6 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Info className="size-4 text-emerald-700 shrink-0" />
                <span>Need to sign in? <Link href="/sign-in" className="text-emerald-700 font-semibold hover:underline">Common Sign In</Link></span>
              </div>

              <Button
                type="submit"
                disabled={loading || success}
                className="w-full sm:w-auto bg-[#15803d] hover:bg-[#166534] text-white px-8 h-11 font-semibold text-sm shadow-sm transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Registering Facility...
                  </>
                ) : (
                  <>
                    Register Facility
                    <ArrowRight className="ml-2 size-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-slate-400">
          Share a Plate adheres to Sri Lankan public health and safe food handling protocols.
        </div>
      </div>
    </div>
  );
}
