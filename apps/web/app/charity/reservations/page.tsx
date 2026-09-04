'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  MapPin,
  Phone,
  RefreshCcw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ReservationStatus = 'REQUESTED' | 'READY_FOR_PICKUP' | 'COLLECTED' | 'CANCELLED';

type Reservation = {
  id: string;
  title: string;
  supplier: string;
  address: string;
  phone: string;
  deadline: string;
  status: ReservationStatus;
  portions: number;
  category: string;
};

const seedReservations: Reservation[] = [
  {
    id: 'res-1021',
    title: 'Vegetable Biryani & Dhal Curry',
    supplier: 'Cinnamon Grand Colombo',
    address: '77 Galle Road, Colombo 03',
    phone: '011 243 7437',
    deadline: 'Today, 5:45 PM',
    status: 'REQUESTED',
    portions: 20,
    category: 'Pure Veg',
  },
  {
    id: 'res-1044',
    title: 'Fresh Bakery Bundles',
    supplier: 'Perera & Sons Bakery',
    address: '244 Havelock Road, Colombo 05',
    phone: '071 889 2314',
    deadline: 'Today, 6:30 PM',
    status: 'READY_FOR_PICKUP',
    portions: 14,
    category: 'Bakery',
  },
  {
    id: 'res-981',
    title: 'Halal Chicken Rice Packets',
    supplier: 'Hilton Colombo Kitchen',
    address: '15 Sir Chittampalam A. Gardiner Mawatha',
    phone: '077 912 3456',
    deadline: 'Collected on 04 Sep',
    status: 'COLLECTED',
    portions: 18,
    category: 'Halal',
  },
  {
    id: 'res-720',
    title: 'Kandy Lunch Surplus',
    supplier: 'Earl’s Regency Kandy',
    address: 'Sangharaja Mawatha, Kandy',
    phone: '071 223 9988',
    deadline: 'Expired - 06 Sep',
    status: 'CANCELLED',
    portions: 8,
    category: 'Rice & Curry',
  },
];

const tabs: Array<{ key: ReservationStatus | 'ALL'; label: string; className: string }> = [
  { key: 'ALL', label: 'All', className: 'bg-[#eaf7ee] text-[#15803d]' },
  { key: 'REQUESTED', label: 'Requested / Pending', className: 'bg-[#fff7ed] text-[#9a5b00]' },
  { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', className: 'bg-[#edf6ff] text-[#1d4ed8]' },
  { key: 'COLLECTED', label: 'Collected / Rescued', className: 'bg-[#ecfeff] text-[#0f766e]' },
  { key: 'CANCELLED', label: 'Cancelled / Expired', className: 'bg-[#f3f4f6] text-[#475569]' },
];

export default function CharityReservationsPage() {
  const [activeTab, setActiveTab] = useState<ReservationStatus | 'ALL'>('ALL');
  const [reservations, setReservations] = useState(seedReservations);

  const visibleReservations = useMemo(() => {
    if (activeTab === 'ALL') return reservations;
    return reservations.filter((item) => item.status === activeTab);
  }, [activeTab, reservations]);

  const handleCancel = (id: string) => {
    setReservations((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: 'CANCELLED', deadline: 'Cancelled by charity' } : item,
      ),
    );
  };

  const handleModify = (id: string) => {
    setReservations((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, deadline: item.status === 'READY_FOR_PICKUP' ? 'Pickup moved to 7:15 PM' : item.deadline }
          : item,
      ),
    );
  };

  const countByStatus = (status: ReservationStatus) => reservations.filter((r) => r.status === status).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/charity/dashboard" className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#15803d]">Charity Portal</p>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">My Reservations</h1>
            </div>
          </div>
          <Button asChild variant="outline" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100">
            <Link href="/charity/history">View History</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-none bg-white shadow-sm ring-1 ring-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm text-slate-500">
                <span>Requested</span>
                <Clock3 className="h-4 w-4 text-[#d97706]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-extrabold text-[#111827]">{countByStatus('REQUESTED')}</CardContent>
          </Card>

          <Card className="border-none bg-white shadow-sm ring-1 ring-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm text-slate-500">
                <span>Ready</span>
                <ShieldCheck className="h-4 w-4 text-[#2563eb]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-extrabold text-[#111827]">{countByStatus('READY_FOR_PICKUP')}</CardContent>
          </Card>

          <Card className="border-none bg-white shadow-sm ring-1 ring-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm text-slate-500">
                <span>Collected</span>
                <CheckCircle2 className="h-4 w-4 text-[#0f766e]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-extrabold text-[#111827]">{countByStatus('COLLECTED')}</CardContent>
          </Card>

          <Card className="border-none bg-white shadow-sm ring-1 ring-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm text-slate-500">
                <span>Cancelled</span>
                <XCircle className="h-4 w-4 text-[#475569]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-extrabold text-[#111827]">{countByStatus('CANCELLED')}</CardContent>
          </Card>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                  activeTab === tab.key ? `${tab.className} ring-1 ring-inset ring-black/5` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          {visibleReservations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              No reservations in this status yet.
            </div>
          ) : (
            visibleReservations.map((reservation) => (
              <Card key={reservation.id} className="border-none bg-white shadow-sm ring-1 ring-slate-200">
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900">{reservation.title}</h2>
                        <Badge
                          className={
                            reservation.status === 'REQUESTED'
                              ? 'border-[#f59e0b] bg-[#fff7ed] text-[#b45309]'
                              : reservation.status === 'READY_FOR_PICKUP'
                                ? 'border-[#60a5fa] bg-[#eff6ff] text-[#1d4ed8]'
                                : reservation.status === 'COLLECTED'
                                  ? 'border-[#2dd4bf] bg-[#ecfeff] text-[#0f766e]'
                                  : 'border-[#94a3b8] bg-[#f8fafc] text-[#475569]'
                          }
                        >
                          {reservation.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <CalendarClock className="h-4 w-4 text-[#15803d]" />
                          <span>{reservation.deadline}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <RefreshCcw className="h-4 w-4 text-[#d97706]" />
                          <span>{reservation.portions} Portions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#15803d]" />
                          <span>{reservation.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-[#15803d]" />
                          <span>{reservation.phone}</span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-500">
                        Supplier: <span className="font-semibold text-slate-700">{reservation.supplier}</span>
                        <span className="mx-2 text-slate-300">•</span>
                        {reservation.category}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                      {reservation.status !== 'COLLECTED' && reservation.status !== 'CANCELLED' && (
                        <>
                          <Button variant="outline" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100" onClick={() => handleModify(reservation.id)}>
                            Modify
                          </Button>
                          <Button className="bg-[#b91c1c] text-white hover:bg-[#991b1b]" onClick={() => handleCancel(reservation.id)}>
                            Cancel
                          </Button>
                        </>
                      )}

                      {reservation.status === 'READY_FOR_PICKUP' && (
                        <Button className="bg-[#15803d] text-white hover:bg-[#136c35]">View Pickup Details</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
