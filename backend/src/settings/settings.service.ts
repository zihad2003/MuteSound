import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { SaveLocationDto, SaveMutePreferenceDto } from './dto/settings.dto';
import {
  CalculationMethod,
  PrayerName,
  formatPrayerList,
  parsePrayerList,
} from '../common/types/enums';
import { PushDispatchService } from '../notifications/push-dispatch.service';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushDispatchService,
  ) {}

  async saveLocation(userId: string, dto: SaveLocationDto): Promise<{ success: true }> {
    await this.prisma.locationSetting.upsert({
      where: { userId },
      create: {
        id: uuidv4(),
        userId,
        city: dto.city,
        latitude: dto.latitude,
        longitude: dto.longitude,
        calculationMethod: dto.calculation_method as string,
      },
      update: {
        city: dto.city,
        latitude: dto.latitude,
        longitude: dto.longitude,
        calculationMethod: dto.calculation_method as string,
      },
    });
    await this.notifySettingsUpdated(userId);
    return { success: true };
  }

  async getLocation(userId: string): Promise<{
    city: string;
    latitude: number;
    longitude: number;
    calculation_method: CalculationMethod;
  }> {
    const loc = await this.prisma.locationSetting.findUnique({ where: { userId } });
    if (!loc) {
      throw new NotFoundException({ message: 'Location not configured.', code: 'LOCATION_NOT_SET' });
    }
    return {
      city: loc.city,
      latitude: loc.latitude,
      longitude: loc.longitude,
      calculation_method: loc.calculationMethod as CalculationMethod,
    };
  }

  async saveMutePreference(userId: string, dto: SaveMutePreferenceDto): Promise<{ success: true }> {
    await this.prisma.mutePreference.upsert({
      where: { userId },
      create: {
        id: uuidv4(),
        userId,
        enabledPrayers: formatPrayerList(dto.enabled_prayers),
        muteDurationMinutes: dto.mute_duration_minutes,
        mlVerificationEnabled: dto.ml_verification_enabled ?? false,
      },
      update: {
        enabledPrayers: formatPrayerList(dto.enabled_prayers),
        muteDurationMinutes: dto.mute_duration_minutes,
        mlVerificationEnabled: dto.ml_verification_enabled ?? false,
      },
    });
    await this.notifySettingsUpdated(userId);
    return { success: true };
  }

  private async notifySettingsUpdated(userId: string): Promise<void> {
    try {
      await this.push.notifyUserSettingsUpdated(userId);
    } catch (e) {
      this.logger.warn(
        `Settings push notify failed for user ${userId}`,
        e instanceof Error ? e.message : undefined,
      );
    }
  }

  async getMutePreference(userId: string): Promise<{
    enabled_prayers: PrayerName[];
    mute_duration_minutes: number;
    ml_verification_enabled: boolean;
  }> {
    let pref = await this.prisma.mutePreference.findUnique({ where: { userId } });
    if (!pref) {
      const defaultList: PrayerName[] = [
        PrayerName.fajr,
        PrayerName.dhuhr,
        PrayerName.asr,
        PrayerName.maghrib,
        PrayerName.isha,
      ];
      pref = await this.prisma.mutePreference.create({
        data: {
          id: uuidv4(),
          userId,
          enabledPrayers: formatPrayerList(defaultList),
          muteDurationMinutes: 5,
          mlVerificationEnabled: false,
        },
      });
    }
    return {
      enabled_prayers: parsePrayerList(pref.enabledPrayers),
      mute_duration_minutes: pref.muteDurationMinutes,
      ml_verification_enabled: pref.mlVerificationEnabled,
    };
  }
}
