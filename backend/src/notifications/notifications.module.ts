import { Module } from '@nestjs/common';
import { FcmService } from './fcm.service';
import { PushDispatchService } from './push-dispatch.service';
import { NotificationsController } from './notifications.controller';

@Module({
  controllers: [NotificationsController],
  providers: [FcmService, PushDispatchService],
  exports: [FcmService, PushDispatchService],
})
export class NotificationsModule {}
