import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { AccountService } from './account.service';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@Controller('account')
export class AccountController {
  constructor(private readonly account: AccountService) {}

  @Delete()
  @HttpCode(HttpStatus.OK)
  delete(@CurrentUser() user: JwtPayload) {
    return this.account.requestDeletion(user.sub);
  }
}
