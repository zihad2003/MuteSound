import type {
  LocationSetting,
  MutePreference,
  MuteSession,
  PrayerTimesDay,
  StoredAuth,
} from './types';

export interface ExtensionState {
  auth: StoredAuth | null;
  location: LocationSetting | null;
  preference: MutePreference | null;
  schedule: PrayerTimesDay | null;
  masterEnabled: boolean;
  muteSession: MuteSession;
  deviceId: string | null;
  apiBase: string;
}

const DEFAULT_STATE: ExtensionState = {
  auth: null,
  location: null,
  preference: null,
  schedule: null,
  masterEnabled: true,
  muteSession: { active: false, mutedTabIds: [] },
  deviceId: null,
  apiBase: 'http://localhost:3000/v1',
};

export async function getState(): Promise<ExtensionState> {
  const raw = await chrome.storage.local.get(Object.keys(DEFAULT_STATE));
  return { ...DEFAULT_STATE, ...raw } as ExtensionState;
}

export async function setState(patch: Partial<ExtensionState>): Promise<void> {
  await chrome.storage.local.set(patch);
}

export async function clearAuth(): Promise<void> {
  await chrome.storage.local.set({
    auth: null,
    deviceId: null,
    location: null,
    preference: null,
    schedule: null,
  });
}
