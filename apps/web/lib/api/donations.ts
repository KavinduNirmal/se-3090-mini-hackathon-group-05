export interface DonationPayload {
  donorId?: string;
  donorName?: string;
  foodName?: string;
  title?: string;
  category?: string;
  portions: number;
  estimatedWeight?: number;
  weightKg?: number;
  dietary?: string[];
  temperature?: string;
  preparedTime?: string;
  expiryTime: string;
  pickupAddress: string;
  contactNumber: string;
  pickupNotes?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchDonationMetrics() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/donations/metrics`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.warn('[api] Failed to fetch metrics from server, using local fallback:', err);
    return null;
  }
}

export async function fetchDonations(status?: string, query?: string) {
  try {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (query) params.append('query', query);

    const res = await fetch(`${API_BASE_URL}/api/donations?${params.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.warn('[api] Failed to fetch donations from server, using local fallback:', err);
    return null;
  }
}

export async function createDonationApi(payload: DonationPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/donations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to create donation');
    }
    return data.data;
  } catch (err: any) {
    console.warn('[api] Backend API call exception:', err.message);
    throw err;
  }
}

export async function updateDonationStatusApi(id: string, status: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/donations/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update donation status');
    }
    return data.data;
  } catch (err) {
    console.warn('[api] Failed to update status on server:', err);
    return null;
  }
}
