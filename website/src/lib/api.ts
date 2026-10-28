import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './auth';
import type {
  AuthTokens,
  Device,
  LocationSetting,
  MutePreference,
  PrayerTimesDay,
  PrayerTimesWeek,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000/v1';

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  retry?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, retry = true } = options;
  const headers: Record<string, string> = {};

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(path, { ...options, retry: false });
    }
    clearTokens();
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = data?.error ?? {};
    throw new ApiError(
      res.status,
      err.code ?? 'REQUEST_FAILED',
      err.message ?? `Request failed (${res.status})`,
    );
  }

  return data as T;
}

async function tryRefresh(): Promise<boolean> {
  const refresh_token = getRefreshToken();
  if (!refresh_token) return false;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { token: string };
    const existingRefresh = getRefreshToken();
    if (!existingRefresh) return false;
    setTokens({ token: data.token, refresh_token: existingRefresh });
    return true;
  } catch {
    return false;
  }
}

export const api = {
  signup(email: string, password: string) {
    return request<{ id: string; email: string; token: string; refresh_token: string }>(
      '/auth/signup',
      { method: 'POST', body: { email, password }, auth: false },
    );
  },

  login(email: string, password: string) {
    return request<AuthTokens>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
  },

  googleAuth(id_token: string) {
    return request<AuthTokens & { is_new_user: boolean }>('/auth/google', {
      method: 'POST',
      body: { id_token },
      auth: false,
    });
  },

  getLocation() {
    return request<LocationSetting>('/settings/location');
  },

  saveLocation(payload: LocationSetting) {
    return request<{ success: boolean }>('/settings/location', {
      method: 'POST',
      body: payload,
    });
  },

  getMutePreference() {
    return request<MutePreference>('/settings/mute-preference');
  },

  saveMutePreference(payload: MutePreference) {
    return request<{ success: boolean }>('/settings/mute-preference', {
      method: 'POST',
      body: payload,
    });
  },

  getPrayerTimes(city: string, date?: string) {
    const params = new URLSearchParams({ city });
    if (date) params.set('date', date);
    return request<PrayerTimesDay>(`/prayer-times?${params.toString()}`, { auth: false });
  },

  getMyPrayerTimes() {
    return request<PrayerTimesDay>('/prayer-times/me');
  },

  getPrayerTimesWeek(city: string) {
    const params = new URLSearchParams({ city });
    return request<PrayerTimesWeek>(`/prayer-times/week?${params.toString()}`, { auth: false });
  },

  getMyPrayerTimesWeek() {
    return request<PrayerTimesWeek>('/prayer-times/me/week');
  },

  listDevices() {
    return request<{ devices: Device[] }>('/devices');
  },

  deleteDevice(id: string) {
    return request<void>(`/devices/${id}`, { method: 'DELETE' });
  },

  deleteAccount() {
    return request<{ success: boolean; message: string }>('/account', { method: 'DELETE' });
  },
};
