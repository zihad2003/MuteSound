import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DevicePlatform } from '../common/types/enums';
import { FcmService } from './fcm.service';
import { PushMessageType, PushPayload, PushSendResult } from './push.types';

/** Platforms that receive FCM. Chrome extension uses chrome.alarms + pull sync instead. */
const FCM_PLATFORMS: string[] = [DevicePlatform.android, DevicePlatform.ios];

@Injectable()
export class PushDispatchService {
  private readonly logger = new Logger(PushDispatchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fcm: FcmService,
  ) {}

  isEnabled(): boolean {
    return this.fcm.isEnabled();
  }

  /** Notify one user's FCM devices that settings/schedule should be re-synced. */
  async notifyUserSettingsUpdated(userId: string): Promise<PushSendResult> {
    return this.dispatchToUser(userId, {
      type: PushMessageType.settings_updated,
      title: 'MuteSound settings updated',
      body: 'Your location or mute preferences changed. Refreshing schedule.',
      data: { type: PushMessageType.settings_updated },
    });
  }

  /**
   * After prayer-time cache prefetch for a city, notify Android/iOS devices
   * whose location setting matches that city.
   */
  async notifyScheduleUpdatedForCity(city: string, dateIso: string): Promise<PushSendResult> {
    const locations = await this.prisma.locationSetting.findMany({
      where: { city },
      select: { userId: true },
    });
    const userIds = [...new Set(locations.map((l) => l.userId))];
    if (userIds.length === 0) {
      return { successCount: 0, failureCount: 0, prunedTokens: [] };
    }

    const devices = await this.prisma.device.findMany({
      where: {
        userId: { in: userIds },
        platform: { in: FCM_PLATFORMS },
        pushToken: { not: null },
      },
      select: { pushToken: true },
    });

    const tokens = devices
      .map((d) => d.pushToken)
      .filter((t): t is string => typeof t === 'string' && t.length > 0);

    return this.sendAndPrune(tokens, {
      type: PushMessageType.schedule_updated,
      title: 'Prayer schedule updated',
      body: `Today's Azan times for ${city} are ready.`,
      data: {
        type: PushMessageType.schedule_updated,
        city,
        date: dateIso,
      },
    });
  }

  /** Optional reminder near Azan — mute still relies on local AlarmManager on Android. */
  async notifyMuteReminder(
    userId: string,
    prayer: string,
    muteDurationMinutes: number,
  ): Promise<PushSendResult> {
    return this.dispatchToUser(userId, {
      type: PushMessageType.mute_reminder,
      title: `Azan — ${prayer}`,
      body: `Mute window starting (${muteDurationMinutes} min).`,
      data: {
        type: PushMessageType.mute_reminder,
        prayer,
        mute_duration_minutes: String(muteDurationMinutes),
      },
    });
  }

  /** Connectivity check for the authenticated user's FCM devices. */
  async sendTestPush(userId: string): Promise<PushSendResult & { fcm_enabled: boolean }> {
    const result = await this.dispatchToUser(userId, {
      type: PushMessageType.test,
      title: 'MuteSound test',
      body: 'FCM is configured correctly.',
      data: { type: PushMessageType.test },
    });
    return { ...result, fcm_enabled: this.fcm.isEnabled() };
  }

  private async dispatchToUser(userId: string, payload: PushPayload): Promise<PushSendResult> {
    const devices = await this.prisma.device.findMany({
      where: {
        userId,
        platform: { in: FCM_PLATFORMS },
        pushToken: { not: null },
      },
      select: { pushToken: true },
    });
    const tokens = devices
      .map((d) => d.pushToken)
      .filter((t): t is string => typeof t === 'string' && t.length > 0);
    return this.sendAndPrune(tokens, payload);
  }

  private async sendAndPrune(tokens: string[], payload: PushPayload): Promise<PushSendResult> {
    if (tokens.length === 0) {
      this.logger.debug(`No FCM tokens for push type=${payload.type}`);
      return { successCount: 0, failureCount: 0, prunedTokens: [] };
    }

    const result = await this.fcm.sendToTokens(tokens, payload);
    if (result.prunedTokens.length > 0) {
      await this.prisma.device.updateMany({
        where: { pushToken: { in: result.prunedTokens } },
        data: { pushToken: null },
      });
      this.logger.log(`Cleared ${result.prunedTokens.length} invalid FCM token(s).`);
    }

    this.logger.log(
      `Push type=${payload.type}: ok=${result.successCount} fail=${result.failureCount}` +
        (this.fcm.isEnabled() ? '' : ' (FCM disabled / no-op)'),
    );
    return result;
  }
}
