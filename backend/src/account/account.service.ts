import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async requestDeletion(userId: string): Promise<{ success: true; message: string }> {
    // Cascade via Prisma schema onDelete: Cascade removes location, mute pref, devices, refresh tokens.
    await this.prisma.user.delete({ where: { id: userId } });
    return {
      success: true,
      message: 'Account and all associated data deletion scheduled.',
    };
  }
}
