import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DevicePlatform } from '../../common/types/enums';

export class RegisterDeviceDto {
  @IsEnum(DevicePlatform)
  platform: DevicePlatform;

  @IsOptional()
  @IsString()
  push_token?: string;
}
