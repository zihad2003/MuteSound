import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { CalculationMethod } from '../common/types/enums';

export interface AladhanTimings {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

export interface AladhanByCityResponse {
  code: number;
  status: string;
  data: {
    timings: AladhanTimings;
    date: {
      gregorian: { date: string };
    };
    meta: { timezone: string };
  };
}

export interface AladhanCalendarResponse {
  code: number;
  status: string;
  data: Array<{
    timings: AladhanTimings;
    date: { gregorian: { date: string } };
  }>;
}

const METHOD_NUM: Record<CalculationMethod, number> = {
  DHAKA: 11,
  KARACHI: 1,
  MWL: 3,
  ISNA: 2,
  EGYPT: 5,
  MAKKAH: 4,
};

@Injectable()
export class AladhanService {
  private readonly client: AxiosInstance;
  private readonly defaultCountry: string;

  constructor(private readonly configService: ConfigService) {
    const baseURL = this.configService.get<string>('ALADHAN_API_BASE', 'https://api.aladhan.com/v1');
    this.defaultCountry = this.configService.get<string>('ALADHAN_DEFAULT_COUNTRY', 'Bangladesh');
    this.client = axios.create({
      baseURL,
      timeout: 10_000,
      headers: { Accept: 'application/json' },
    });
  }

  async fetchTimingsByCity(
    city: string,
    date: Date,
    method: CalculationMethod,
    country?: string,
  ): Promise<{ timings: AladhanTimings; date: string }> {
    const dateStr = this.toDDMM(date);
    const methodNum = METHOD_NUM[method] ?? METHOD_NUM.DHAKA;
    try {
      const { data } = await this.client.get<AladhanByCityResponse>(`/timingsByCity/${dateStr}`, {
        params: {
          city,
          country: country ?? this.defaultCountry,
          method: methodNum,
        },
      });
      if (data.code !== 200) {
        throw new Error(`Aladhan API returned code ${data.code}: ${data.status}`);
      }
      return { timings: data.data.timings, date: this.normalizeDate(data.data.date.gregorian.date) };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      throw new InternalServerErrorException({
        message: 'Failed to fetch prayer times from Aladhan.',
        code: 'ALADHAN_FETCH_ERROR',
        details: msg,
      });
    }
  }

  async fetchCalendarByCity(
    city: string,
    year: number,
    month: number,
    method: CalculationMethod,
    country?: string,
  ): Promise<Array<{ date: string; timings: AladhanTimings }>> {
    const methodNum = METHOD_NUM[method] ?? METHOD_NUM.DHAKA;
    try {
      const { data } = await this.client.get<AladhanCalendarResponse>('/calendarByCity', {
        params: {
          city,
          country: country ?? this.defaultCountry,
          method: methodNum,
          month,
          year,
        },
      });
      if (data.code !== 200) {
        throw new Error(`Aladhan API returned code ${data.code}: ${data.status}`);
      }
      return data.data.map((d) => ({
        date: this.normalizeDate(d.date.gregorian.date),
        timings: d.timings,
      }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      throw new InternalServerErrorException({
        message: 'Failed to fetch prayer time calendar from Aladhan.',
        code: 'ALADHAN_FETCH_ERROR',
        details: msg,
      });
    }
  }

  private toDDMM(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  // Aladhan uses DD-MM-YYYY gregorian date; convert to ISO YYYY-MM-DD
  private normalizeDate(gregorianDate: string): string {
    const [dd, mm, yyyy] = gregorianDate.split('-');
    return `${yyyy}-${mm}-${dd}`;
  }
}
