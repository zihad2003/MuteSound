import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { PushDispatchService } from './push-dispatch.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly push: PushDispatchService) {}

  /**
   * Send a test FCM to the caller's registered Android/iOS tokens.
   * Returns fcm_enabled=false (and zero successes) when Firebase credentials are missing.
   */
  @Post('test')
  @HttpCode(HttpStatus.OK)
  test(@CurrentUser() user: JwtPayload) {
    return this.push.sendTestPush(user.sub);
  }
}
