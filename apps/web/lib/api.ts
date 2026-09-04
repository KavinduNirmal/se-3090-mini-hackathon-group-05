/**
 * API client for the Express modular monolith backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface ApiResponse<T = any> {
  status: 'success' | 'fail' | 'error';
  message?: string;
  data?: T;
  details?: Record<string, string>;
}

export interface CharityRegisterPayload {
  email: string;
  password: string;
  role: 'CHARITY';
  orgName: string;
  charityType: 'ORPHANAGE' | 'ELDER_CARE' | 'COMMUNITY_KITCHEN' | 'SHELTER' | 'NGO_HUB' | 'OTHER';
  regNumber?: string;
  contactPerson: string;
  phone: string;
  address: string;
  city: string;
  district?: string;
  beneficiaryCount?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthSession {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'CHARITY' | 'DONOR' | 'ADMIN';
    status: string;
    createdAt: string;
    charityProfile?: {
      id: string;
      orgName: string;
      charityType: string;
      regNumber?: string;
      contactPerson: string;
      phone: string;
      address: string;
      city: string;
      district?: string;
      beneficiaryCount?: number;
      isVerified: boolean;
    };
    donorProfile?: {
      id: string;
      businessName: string;
      donorType: string;
      contactPerson: string;
      phone: string;
      address: string;
      city: string;
      district?: string;
      isVerified: boolean;
    };
  };
}

const TOKEN_KEY = 'bhoomi_auth_token';
const USER_KEY = 'bhoomi_auth_user';

export const authStorage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setSession: (session: AuthSession) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
    // Also save simple cookie for SSR checks if needed
    document.cookie = `bhoomi_role=${session.user.role.toLowerCase()}; path=/; max-age=604800; SameSite=Lax`;
  },
  getUser: (): AuthSession['user'] | null => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  clearSession: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    document.cookie = 'bhoomi_role=; path=/; max-age=0';
  },
};

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({
      status: 'error',
      message: 'Failed to parse response from server',
    }));

    if (!res.ok) {
      // The backend returns JSON errors; a non-JSON body (e.g. a 404 page from
      // a host without the API) means NEXT_PUBLIC_API_URL is misconfigured.
      const isMisrouted = data.message === 'Failed to parse response from server';
      const base = data.message || `Request failed with status ${res.status}`;
      const suffix = isMisrouted
        ? ` (${res.status} for ${url}). Is NEXT_PUBLIC_API_URL (${API_BASE_URL}) pointing at the Express API server?`
        : '';
      throw new Error(`${base}${suffix}`);
    }

    return data;
  } catch (err: any) {
    throw new Error(err.message || 'Network error connecting to API');
  }
}

export const authApi = {
  registerCharity: async (payload: CharityRegisterPayload) => {
    return apiRequest<AuthSession>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  login: async (payload: LoginPayload) => {
    return apiRequest<AuthSession>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getMe: async () => {
    return apiRequest<{ user: AuthSession['user'] }>('/api/auth/me', {
      method: 'GET',
    });
  },
};

export const rescueApi = {
  getDonation: async (id: string) => {
    return apiRequest<{ donation: any }>(`/api/donations/${id}`, {
      method: 'GET',
    });
  },

  reserveDonation: async (id: string, payload: {
    portionsRequested: number;
    pickupEta?: string;
    notes?: string;
    charityName?: string;
    charityId?: string;
  }) => {
    return apiRequest<{
      reservation: any;
      verificationCode: string;
      message: string;
    }>(`/api/donations/${id}/reserve`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getReservation: async (id: string) => {
    return apiRequest<{ reservation: any }>(`/api/donations/reservations/${id}`, {
      method: 'GET',
    });
  },
};

