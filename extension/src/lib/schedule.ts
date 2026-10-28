import type { MutePreference, PrayerName, PrayerTimesDay } from './types';
import { ALL_PRAYERS } from './types';

export interface ScheduledMute {
  prayer: PrayerName;
  when: Date;
  alarmName: string;
}

function parseTodayTime(hhmm: string, now = new Date()): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(now);
  d.setHours(h, m, 0, 0);
  return d;
}

export function buildMuteSchedule(
  day: PrayerTimesDay,
  preference: MutePreference,
  now = new Date(),
): ScheduledMute[] {
  const enabled = new Set(preference.enabled_prayers);
  const items: ScheduledMute[] = [];

  for (const prayer of ALL_PRAYERS) {
    if (!enabled.has(prayer)) continue;
    const time = day[prayer];
    if (!time) continue;
    const when = parseTodayTime(time, now);
    if (when.getTime() <= now.getTime()) continue;
    items.push({
      prayer,
      when,
      alarmName: `mutesound-mute-${day.date}-${prayer}`,
    });
  }
  return items;
}

export function nextPrayer(
  day: PrayerTimesDay,
  preference: MutePreference,
  now = new Date(),
): ScheduledMute | null {
  const list = buildMuteSchedule(day, preference, now);
  return list[0] ?? null;
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}
