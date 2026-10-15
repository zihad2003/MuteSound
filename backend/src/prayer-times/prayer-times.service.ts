import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { AladhanService, AladhanTimings } from './aladhan.service';
import { CalculationMethod } from '../common/types/enums';

export interface DayPrayerTimes {
  date: string;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

interface PrayerScheduleRow {
  id: string;
  city: string;
  date: Date;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  method: string;
  fetchedAt: Date;
}

@Injectable()
export class PrayerTimesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aladhan: AladhanService,
  ) {}

  private static extractFive(t: AladhanTimings): Omit<DayPrayerTimes, 'date'> {
    return {
      fajr: this.stripSeconds(t.Fajr),
      dhuhr: this.stripSeconds(t.Dhuhr),
      asr: this.stripSeconds(t.Asr),
      maghrib: this.stripSeconds(t.Maghrib),
      isha: this.stripSeconds(t.Isha),
    };
  }

  private static stripSeconds(hhmmss: string): string {
    const parts = hhmmss.split(':');
    return `${parts[0] ?? '00'}:${parts[1] ?? '00'}`;
  }

  async getForDay(
    city: string,
    date: Date,
    method: CalculationMethod = CalculationMethod.DHAKA,
  ): Promise<DayPrayerTimes & { city: string; method: CalculationMethod }> {
    const dayOnly = this.startOfDay(date);
    let row = (await this.prisma.prayerSchedule.findUnique({
      where: { city_date: { city, date: dayOnly } },
    })) as PrayerScheduleRow | null;
    if (!row) {
      row = await this.fetchAndCache(city, dayOnly, method);
    }
    return {
      city: row.city,
      date: this.toISODate(row.date),
      fajr: row.fajr,
      dhuhr: row.dhuhr,
      asr: row.asr,
      maghrib: row.maghrib,
      isha: row.isha,
      method: row.method as CalculationMethod,
    };
  }

  async getForWeek(city: string, method: CalculationMethod = CalculationMethod.DHAKA): Promise<{
    city: string;
    days: DayPrayerTimes[];
  }> {
    const today = this.startOfDay(new Date());
    const dates: Date[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      return d;
    });

    const existing = (await this.prisma.prayerSchedule.findMany({
      where: { city, date: { in: dates } },
    })) as PrayerScheduleRow[];
    const byDate = new Map(existing.map((r) => [this.toISODate(r.date), r]));

    const days: DayPrayerTimes[] = [];
    for (const d of dates) {
      const key = this.toISODate(d);
      let row = byDate.get(key);
      if (!row) row = await this.fetchAndCache(city, d, method);
      days.push({
        date: this.toISODate(row.date),
        fajr: row.fajr,
        dhuhr: row.dhuhr,
        asr: row.asr,
        maghrib: row.maghrib,
        isha: row.isha,
      });
    }
    return { city, days };
  }

  private async fetchAndCache(
    city: string,
    date: Date,
    method: CalculationMethod,
  ): Promise<PrayerScheduleRow> {
    const { timings } = await this.aladhan.fetchTimingsByCity(city, date, method);
    const five = PrayerTimesService.extractFive(timings);
    return this.prisma.prayerSchedule.upsert({
      where: { city_date: { city, date } },
      create: {
        id: uuidv4(),
        city,
        date,
        fajr: five.fajr,
        dhuhr: five.dhuhr,
        asr: five.asr,
        maghrib: five.maghrib,
        isha: five.isha,
        method: method as string,
        fetchedAt: new Date(),
      },
      update: {
        fajr: five.fajr,
        dhuhr: five.dhuhr,
        asr: five.asr,
        maghrib: five.maghrib,
        isha: five.isha,
        method: method as string,
        fetchedAt: new Date(),
      },
    }) as unknown as PrayerScheduleRow;
  }

  private startOfDay(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  private toISODate(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
