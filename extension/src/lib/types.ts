export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTimesDay {
  city: string;
  date: string;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  method?: string;
}

export interface MutePreference {
  enabled_prayers: PrayerName[];
  mute_duration_minutes: number;
  ml_verification_enabled: boolean;
}

export interface LocationSetting {
  city: string;
  latitude: number;
  longitude: number;
  calculation_method: string;
}

export interface StoredAuth {
  token: string;
  refresh_token: string;
}

export interface MuteSession {
  active: boolean;
  prayer?: PrayerName;
  mutedTabIds: number[];
  startedAt?: number;
  endsAt?: number;
}

export const ALL_PRAYERS: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};
