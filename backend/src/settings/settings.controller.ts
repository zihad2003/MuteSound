import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SaveLocationDto, SaveMutePreferenceDto } from './dto/settings.dto';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Post('location')
  @HttpCode(HttpStatus.OK)
  saveLocation(@CurrentUser() user: JwtPayload, @Body() dto: SaveLocationDto) {
    return this.settings.saveLocation(user.sub, dto);
  }

  @Get('location')
  getLocation(@CurrentUser() user: JwtPayload) {
    return this.settings.getLocation(user.sub);
  }

  @Post('mute-preference')
  @HttpCode(HttpStatus.OK)
  saveMutePreference(@CurrentUser() user: JwtPayload, @Body() dto: SaveMutePreferenceDto) {
    return this.settings.saveMutePreference(user.sub, dto);
  }

  @Get('mute-preference')
  getMutePreference(@CurrentUser() user: JwtPayload) {
    return this.settings.getMutePreference(user.sub);
  }
}
