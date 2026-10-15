import { IsArray, IsBoolean, IsEnum, IsLatitude, IsLongitude, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { CalculationMethod, PrayerName } from '../../common/types/enums';

export class SaveLocationDto {
  @IsString()
  city: string;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;

  @IsEnum(CalculationMethod)
  calculation_method: CalculationMethod;
}

export class SaveMutePreferenceDto {
  @IsArray()
  @IsEnum(PrayerName, { each: true })
  enabled_prayers: PrayerName[];

  @IsNumber()
  @Min(1)
  @Max(15)
  mute_duration_minutes: number;

  @IsOptional()
  @IsBoolean()
  ml_verification_enabled?: boolean;
}
