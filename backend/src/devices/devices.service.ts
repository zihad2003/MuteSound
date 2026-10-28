import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDeviceDto } from './dto/devices.dto';
import { DevicePlatform } from '../common/types/enums';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Register or refresh a device.
   * - If `push_token` matches an existing row, reassign to this user and refresh lastSyncedAt.
   * - Chrome extension typically omits push_token (uses chrome.alarms); creates a new row once.
   */
  async register(userId: string, dto: RegisterDeviceDto): Promise<{ device_id: string }> {
    const pushToken = dto.push_token?.trim() || null;

    if (pushToken) {
      const existing = await this.prisma.device.findFirst({
        where: { pushToken },
      });
      if (existing) {
        const updated = await this.prisma.device.update({
          where: { id: existing.id },
          data: {
            userId,
            platform: dto.platform as string,
            pushToken,
            lastSyncedAt: new Date(),
          },
        });
        return { device_id: updated.id };
      }
    }

    const device = await this.prisma.device.create({
      data: {
        id: uuidv4(),
        userId,
        platform: dto.platform as string,
        pushToken,
        lastSyncedAt: new Date(),
      },
    });
    return { device_id: device.id };
  }

  async list(userId: string): Promise<{
    devices: Array<{
      id: string;
      platform: DevicePlatform;
      last_synced_at: Date;
      has_push_token: boolean;
    }>;
  }> {
    const rows = await this.prisma.device.findMany({
      where: { userId },
      orderBy: { lastSyncedAt: 'desc' },
    });
    return {
      devices: rows.map((d) => ({
        id: d.id,
        platform: d.platform as DevicePlatform,
        last_synced_at: d.lastSyncedAt,
        has_push_token: Boolean(d.pushToken),
      })),
    };
  }

  async remove(userId: string, deviceId: string): Promise<void> {
    const device = await this.prisma.device.findUnique({ where: { id: deviceId } });
    if (!device) {
      throw new NotFoundException({ message: 'Device not found.', code: 'DEVICE_NOT_FOUND' });
    }
    if (device.userId !== userId) {
      throw new ForbiddenException({ message: 'Not your device.', code: 'NOT_YOUR_DEVICE' });
    }
    await this.prisma.device.delete({ where: { id: deviceId } });
  }
}
