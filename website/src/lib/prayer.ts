import type { MutePreference, PrayerName, PrayerTimesDay } from './types';
import { ALL_PRAYERS, PRAYER_LABELS } from './types';

export interface NextPrayer {
  name: PrayerName;
  label: string;
  time: string;
  at: Date;
  msUntil: number;
}

function parseTodayTime(hhmm: string, now = new Date()): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(now);
  d.setHours(h, m, 0, 0);
  return d;
}

export function getNextPrayer(
  day: PrayerTimesDay,
  preference?: MutePreference | null,
  now = new Date(),
): NextPrayer | null {
  const enabled = new Set(preference?.enabled_prayers ?? ALL_PRAYERS);

  for (const name of ALL_PRAYERS) {
    if (!enabled.has(name)) continue;
    const time = day[name];
    if (!time) continue;
    const at = parseTodayTime(time, now);
    const msUntil = at.getTime() - now.getTime();
    if (msUntil > 0) {
      return { name, label: PRAYER_LABELS[name], time, at, msUntil };
    }
  }
  return null;
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

export function isWithinMuteWindow(
  day: PrayerTimesDay,
  preference: MutePreference,
  now = new Date(),
): { active: boolean; prayer?: PrayerName } {
  const durationMs = preference.mute_duration_minutes * 60 * 1000;
  for (const name of preference.enabled_prayers) {
    const time = day[name];
    if (!time) continue;
    const start = parseTodayTime(time, now).getTime();
    const end = start + durationMs;
    const t = now.getTime();
    if (t >= start && t < end) {
      return { active: true, prayer: name };
    }
  }
  return { active: false };
}
