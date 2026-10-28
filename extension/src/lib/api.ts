import { clearAuth, getState, setState } from './storage';
import type { LocationSetting, MutePreference, PrayerTimesDay, StoredAuth } from './types';

async function apiBase(): Promise<string> {
  const state = await getState();
  return state.apiBase.replace(/\/$/, '');
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = 'GET', body, auth = true } = options;
  const base = await apiBase();
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (auth) {
    const state = await getState();
    if (state.auth?.token) headers.Authorization = `Bearer ${state.auth.token}`;
  }

  let res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const state = await getState();
      if (state.auth?.token) headers.Authorization = `Bearer ${state.auth.token}`;
      res = await fetch(`${base}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } else {
      await clearAuth();
    }
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.error?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

async function tryRefresh(): Promise<boolean> {
  const state = await getState();
  if (!state.auth?.refresh_token) return false;
  try {
    const base = await apiBase();
    const res = await fetch(`${base}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: state.auth.refresh_token }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { token: string };
    await setState({
      auth: { token: data.token, refresh_token: state.auth.refresh_token },
    });
    return true;
  } catch {
    return false;
  }
}

export const api = {
  async login(email: string, password: string): Promise<StoredAuth> {
    return request<StoredAuth>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
  },

  getLocation() {
    return request<LocationSetting>('/settings/location');
  },

  getMutePreference() {
    return request<MutePreference>('/settings/mute-preference');
  },

  getMyPrayerTimes() {
    return request<PrayerTimesDay>('/prayer-times/me');
  },

  /** Chrome uses chrome.alarms — no FCM push_token. Android registers with push_token separately. */
  registerDevice() {
    return request<{ device_id: string }>('/devices/register', {
      method: 'POST',
      body: { platform: 'chrome_extension' },
    });
  },
};
