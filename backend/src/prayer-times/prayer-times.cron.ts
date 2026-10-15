import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { PrayerTimesService } from './prayer-times.service';
import { CalculationMethod } from '../common/types/enums';

@Injectable()
export class PrayerTimesCron {
  private readonly logger = new Logger(PrayerTimesCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly prayerTimes: PrayerTimesService,
  ) {}

  // Runs daily at 00:05 server-local time; prefetches next 8 days for all cities seen in DB
  @Cron('5 0 * * *', { name: 'prefetch-prayer-times' })
  async prefetchScheduled() {
    this.logger.log('Starting daily prayer-time prefetch job...');
    try {
      // Portable approach: collect distinct (city, method) pairs from both tables
      const fromLoc = await this.prisma.locationSetting.findMany({
        select: { city: true, calculationMethod: true },
        distinct: ['city', 'calculationMethod'],
      });
      const fromSched = await this.prisma.prayerSchedule.findMany({
        select: { city: true, method: true },
        distinct: ['city', 'method'],
      });

      const seen = new Set<string>();
      const combos: Array<{ city: string; method: CalculationMethod }> = [];

      const push = (city: string, methodRaw: string) => {
        const key = `${city}|${methodRaw}`;
        if (seen.has(key)) return;
        seen.add(key);
        combos.push({ city, method: methodRaw as CalculationMethod });
      };
      fromLoc.forEach((l) => push(l.city, l.calculationMethod));
      fromSched.forEach((r) => push(r.city, r.method));

      if (combos.length === 0) {
        this.logger.log('No cities to prefetch yet — skipping.');
        return;
      }
      const today = new Date();
      for (let offset = 0; offset < 8; offset++) {
        const d = new Date(today);
        d.setDate(today.getDate() + offset);
        for (const { city, method } of combos) {
          try {
            await this.prayerTimes.getForDay(city, d, method);
          } catch (e) {
            this.logger.error(
              `Failed to prefetch ${city} (${method}) +${offset}d`,
              e instanceof Error ? e.stack : undefined,
            );
          }
        }
      }
      this.logger.log(`Prefetch job complete — handled ${combos.length} city/method combos.`);
    } catch (e) {
      this.logger.error('Prefetch job failed', e instanceof Error ? e.stack : undefined);
    }
  }
}
