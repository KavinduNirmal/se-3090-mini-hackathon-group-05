'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  FileText,
  Search,
  TrendingUp,
  Utensils,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type HistoryEntry = {
  id: string;
  date: string;
  title: string;
  supplier: string;
  city: string;
  portions: number;
  status: 'Rescued' | 'Pending' | 'Expired';
};

const historySeed: HistoryEntry[] = [
  {
    id: 'h-1',
    date: '2026-09-04',
    title: 'Vegetable Biryani & Dhal Curry',
    supplier: 'Cinnamon Grand Colombo',
    city: 'Colombo 03',
    portions: 22,
    status: 'Rescued',
  },
  {
    id: 'h-2',
    date: '2026-09-03',
    title: 'Bakery Surplus Bundle',
    supplier: 'Perera & Sons Bakery',
    city: 'Colombo 05',
    portions: 14,
    status: 'Pending',
  },
  {
    id: 'h-3',
    date: '2026-09-02',
    title: 'Halal Chicken Rice Packets',
    supplier: 'Hilton Colombo Kitchen',
    city: 'Colombo 02',
    portions: 19,
    status: 'Rescued',
  },
  {
    id: 'h-4',
    date: '2026-09-01',
    title: 'Kandy Lunch Surplus',
    supplier: 'Earl’s Regency Kandy',
    city: 'Kandy',
    portions: 8,
    status: 'Expired',
  },
];

export default function CharityHistoryPage() {
  const [search, setSearch] = useState('');

  const filteredHistory = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return historySeed;

    return historySeed.filter(
      (entry) =>
        entry.title.toLowerCase().includes(query) ||
        entry.supplier.toLowerCase().includes(query) ||
        entry.city.toLowerCase().includes(query),
    );
  }, [search]);

  const exportCsv = () => {
    const header = ['Date', 'Title', 'Supplier', 'City', 'Portions', 'Status'];
    const rows = filteredHistory.map((entry) => [
      entry.date,
      entry.title,
      entry.supplier,
      entry.city,
      String(entry.portions),
      entry.status,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'share-a-plate-rescue-history.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/charity/dashboard" className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#15803d]">Rescue History</p>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Audit Log</h1>
            </div>
          </div>
          <Button onClick={exportCsv} className="bg-[#15803d] text-white hover:bg-[#136c35]">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-none bg-white shadow-sm ring-1 ring-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm text-slate-500">
                <span>Total Meals</span>
                <Utensils className="h-4 w-4 text-[#15803d]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-extrabold text-slate-900">490</CardContent>
          </Card>

          <Card className="border-none bg-white shadow-sm ring-1 ring-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm text-slate-500">
                <span>Active Claims</span>
                <TrendingUp className="h-4 w-4 text-[#d97706]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-extrabold text-slate-900">7</CardContent>
          </Card>

          <Card className="border-none bg-white shadow-sm ring-1 ring-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm text-slate-500">
                <span>Partner Restaurants</span>
                <Users className="h-4 w-4 text-[#1d4ed8]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-extrabold text-slate-900">24</CardContent>
          </Card>

          <Card className="border-none bg-white shadow-sm ring-1 ring-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm text-slate-500">
                <span>Expiring Soon</span>
                <AlertTriangle className="h-4 w-4 text-[#b45309]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-extrabold text-slate-900">4</CardContent>
          </Card>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by food, supplier, or city..."
                className="pl-9 border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-2 rounded-full bg-[#f0fdf4] px-3 py-2 text-xs font-semibold text-[#15803d]">
              <FileText className="h-4 w-4" />
              Audit-ready timeline
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            <span>Meal</span>
            <span>Supplier</span>
            <span>City</span>
            <span>Portions</span>
            <span>Status</span>
          </div>

          {filteredHistory.map((entry) => (
            <div key={entry.id} className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr] gap-3 border-b border-slate-100 px-4 py-4 text-sm last:border-b-0">
              <div>
                <p className="font-semibold text-slate-800">{entry.title}</p>
                <p className="mt-1 text-xs text-slate-500">{entry.date}</p>
              </div>
              <span className="text-slate-600">{entry.supplier}</span>
              <span className="text-slate-600">{entry.city}</span>
              <span className="font-semibold text-slate-800">{entry.portions}</span>
              <span>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    entry.status === 'Rescued'
                      ? 'bg-[#ecfdf5] text-[#166534]'
                      : entry.status === 'Pending'
                        ? 'bg-[#fff7ed] text-[#b45309]'
                        : 'bg-[#f3f4f6] text-[#475569]'
                  }`}
                >
                  {entry.status}
                </span>
              </span>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
