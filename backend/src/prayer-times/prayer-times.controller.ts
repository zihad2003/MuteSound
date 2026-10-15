import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { CalculationMethod } from '../common/types/enums';
import { PrayerTimesService } from './prayer-times.service';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('prayer-times')
export class PrayerTimesController {
  constructor(
    private readonly prayerTimes: PrayerTimesService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Get()
  async getDay(
    @Query('city') cityQuery?: string,
    @Query('date') dateQuery?: string,
  ) {
    const city = cityQuery?.trim();
    if (!city) {
      throw new BadRequestException({ message: 'Query param city is required.', code: 'MISSING_CITY' });
    }
    let date = new Date();
    if (dateQuery?.trim()) {
      const parsed = new Date(dateQuery.trim());
      if (Number.isNaN(parsed.getTime())) {
        throw new BadRequestException({ message: 'Invalid date format. Use YYYY-MM-DD.', code: 'INVALID_DATE' });
      }
      date = parsed;
    }
    return this.prayerTimes.getForDay(city, date, CalculationMethod.DHAKA);
  }

  @Public()
  @Get('week')
  async getWeek(@Query('city') cityQuery?: string) {
    const city = cityQuery?.trim();
    if (!city) {
      throw new BadRequestException({ message: 'Query param city is required.', code: 'MISSING_CITY' });
    }
    return this.prayerTimes.getForWeek(city, CalculationMethod.DHAKA);
  }

  @Get('me')
  async getForCurrentUser(@CurrentUser() user: JwtPayload) {
    const loc = await this.prisma.locationSetting.findUnique({ where: { userId: user.sub } });
    if (!loc) {
      throw new BadRequestException({
        message: 'Location not configured. POST /settings/location first.',
        code: 'LOCATION_NOT_SET',
      });
    }
    return this.prayerTimes.getForDay(loc.city, new Date(), loc.calculationMethod as CalculationMethod);
  }

  @Get('me/week')
  async getForCurrentUserWeek(@CurrentUser() user: JwtPayload) {
    const loc = await this.prisma.locationSetting.findUnique({ where: { userId: user.sub } });
    if (!loc) {
      throw new BadRequestException({
        message: 'Location not configured. POST /settings/location first.',
        code: 'LOCATION_NOT_SET',
      });
    }
    return this.prayerTimes.getForWeek(loc.city, loc.calculationMethod as CalculationMethod);
  }
}
