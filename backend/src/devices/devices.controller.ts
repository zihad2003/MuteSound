import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { RegisterDeviceDto } from './dto/devices.dto';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devices: DevicesService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@CurrentUser() user: JwtPayload, @Body() dto: RegisterDeviceDto) {
    return this.devices.register(user.sub, dto);
  }

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.devices.list(user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.devices.remove(user.sub, id);
  }
}
