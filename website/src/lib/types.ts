export type CalculationMethod = 'DHAKA' | 'KARACHI' | 'MWL' | 'ISNA' | 'EGYPT';

export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type DevicePlatform = 'android' | 'chrome_extension' | 'ios';

export interface AuthTokens {
  token: string;
  refresh_token: string;
}

export interface LocationSetting {
  city: string;
  latitude: number;
  longitude: number;
  calculation_method: CalculationMethod;
}

export interface MutePreference {
  enabled_prayers: PrayerName[];
  mute_duration_minutes: number;
  ml_verification_enabled: boolean;
}

export interface PrayerTimesDay {
  city: string;
  date: string;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  method?: CalculationMethod | string;
}

export interface PrayerTimesWeek {
  city: string;
  days: Array<{
    date: string;
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  }>;
}

export interface Device {
  id: string;
  platform: DevicePlatform | string;
  last_synced_at: string;
  /** Present for Android/iOS FCM registrations; Chrome extension is usually false. */
  has_push_token?: boolean;
}

export const CALCULATION_METHODS: { value: CalculationMethod; label: string }[] = [
  { value: 'DHAKA', label: 'University of Islamic Sciences, Karachi (Dhaka)' },
  { value: 'KARACHI', label: 'University of Islamic Sciences, Karachi' },
  { value: 'MWL', label: 'Muslim World League' },
  { value: 'ISNA', label: 'Islamic Society of North America' },
  { value: 'EGYPT', label: 'Egyptian General Authority of Survey' },
];

export const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

export const ALL_PRAYERS: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
