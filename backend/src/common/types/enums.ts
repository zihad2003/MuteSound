// Application-level enums. Always import from here rather than Prisma,
// because for local SQLite smoke testing the Prisma schema uses plain String
// fields instead of native enums (SQLite doesn't support them). These TypeScript
// enums + class-validator @IsEnum() decorators continue to enforce validity
// at the application layer identically.

export enum CalculationMethod {
  DHAKA = 'DHAKA',
  KARACHI = 'KARACHI',
  MWL = 'MWL',
  ISNA = 'ISNA',
  EGYPT = 'EGYPT',
  MAKKAH = 'MAKKAH',
}

export enum PrayerName {
  fajr = 'fajr',
  dhuhr = 'dhuhr',
  asr = 'asr',
  maghrib = 'maghrib',
  isha = 'isha',
}

export enum DevicePlatform {
  android = 'android',
  chrome_extension = 'chrome_extension',
  ios = 'ios',
}

export const PRAYER_ORDER: PrayerName[] = [
  PrayerName.fajr,
  PrayerName.dhuhr,
  PrayerName.asr,
  PrayerName.maghrib,
  PrayerName.isha,
];

export function parsePrayerList(csv: string): PrayerName[] {
  if (!csv) return [...PRAYER_ORDER];
  const vals = csv
    .split(',')
    .map((s) => s.trim() as PrayerName)
    .filter((v) => (Object.values(PrayerName) as string[]).includes(v));
  return vals.length > 0 ? vals : [...PRAYER_ORDER];
}

export function formatPrayerList(arr: PrayerName[]): string {
  return arr.join(',');
}
