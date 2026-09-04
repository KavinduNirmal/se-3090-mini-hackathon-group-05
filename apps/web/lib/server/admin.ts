import { auth } from '@clerk/nextjs/server';

// Server-side helper for the Express admin REST API (/api/admin).
// The web app is the trusted client: it attaches the signed-in user's Clerk
// session token as a Bearer token and the Express server verifies it plus the
// admin role before responding.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface DonationsByStatus {
  active: number;
  claimed: number;
  collected: number;
  expired: number;
  removed: number;
}

export interface OverviewData {
  restaurantsByStatus: { pending: number; active: number; suspended: number; rejected: number };
  charitiesByStatus: { pending: number; active: number; rejected: number };
  donationsByStatus: DonationsByStatus;
  totalRestaurants: number;
  totalCharities: number;
  totalDonations: number;
  activeDonations: number;
  claimedDonations: number;
  completedRescues: number;
  expiredDonations: number;
  removedDonations: number;
  flaggedDonations: number;
  totalKgRescued: number;
}

export interface AdminCharity {
  id: string;
  name: string;
  type: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  registrationNo: string | null;
  verified: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminRestaurant {
  id: string;
  clerkUserId: string | null;
  name: string;
  type: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  licenseNo: string | null;
  hygieneRating: number | null;
  verified: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminClaim {
  name?: string;
  type?: string | null;
  verified?: boolean;
  contactName?: string | null;
  phone?: string | null;
}

export interface AdminDonation {
  id: string;
  donorId: string | null;
  donorName: string;
  title: string;
  category: string;
  portions: number;
  weightKg: number;
  dietary: string[];
  status: string;
  temperature: string | null;
  preparedTime: string | null;
  expiryTime: string;
  pickupAddress: string;
  contactNumber: string;
  pickupNotes: string | null;
  claimedByCharity: AdminClaim | null;
  flagged: boolean;
  flagReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export class AdminApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

interface ApiEnvelope<T> {
  status: 'success' | 'fail' | 'error';
  message?: string;
  data?: T;
}

export async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { getToken } = await auth();
  const token = await getToken();

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/admin${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
      cache: 'no-store',
    });
  } catch (err) {
    throw new AdminApiError(
      `Could not reach the Share a Plate API at ${API_BASE_URL}. Start the server app and try again.`,
      0,
    );
  }

  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // Non-JSON failure body.
  }

  if (!res.ok || !body || body.status !== 'success' || body.data === undefined) {
    throw new AdminApiError(body?.message || `Admin API request failed (${res.status})`, res.status);
  }

  return body.data as T;
}

export function getOverview(): Promise<OverviewData> {
  return adminFetch<OverviewData>('/overview');
}

export async function listCharities(options: { status?: string; q?: string } = {}): Promise<AdminCharity[]> {
  const params = new URLSearchParams();
  if (options.status) params.set('status', options.status);
  if (options.q) params.set('q', options.q);
  const qs = params.toString();
  return adminFetch<AdminCharity[]>(`/charities${qs ? `?${qs}` : ''}`);
}

export async function listRestaurants(options: { status?: string; q?: string } = {}): Promise<AdminRestaurant[]> {
  const params = new URLSearchParams();
  if (options.status) params.set('status', options.status);
  if (options.q) params.set('q', options.q);
  const qs = params.toString();
  return adminFetch<AdminRestaurant[]>(`/restaurants${qs ? `?${qs}` : ''}`);
}

export async function listDonations(options: { status?: string; flagged?: 'true' | 'false' } = {}): Promise<AdminDonation[]> {
  const params = new URLSearchParams();
  if (options.status) params.set('status', options.status);
  if (options.flagged) params.set('flagged', options.flagged);
  const qs = params.toString();
  return adminFetch<AdminDonation[]>(`/donations${qs ? `?${qs}` : ''}`);
}
