import { Module } from '@nestjs/common';
import { PrayerTimesController } from './prayer-times.controller';
import { PrayerTimesService } from './prayer-times.service';
import { AladhanService } from './aladhan.service';
import { PrayerTimesCron } from './prayer-times.cron';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [PrayerTimesController],
  providers: [PrayerTimesService, AladhanService, PrayerTimesCron],
  exports: [PrayerTimesService, AladhanService],
})
export class PrayerTimesModule {}
