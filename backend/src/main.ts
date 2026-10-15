import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const apiPrefix = configService.get<string>('API_PREFIX', 'v1');
  app.setGlobalPrefix(apiPrefix);

  const corsOriginsRaw = configService.get<string>('CORS_ORIGINS', '');
  const corsOrigins = corsOriginsRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const matched = corsOrigins.some((allowed) => {
        if (allowed.endsWith('*')) {
          return origin.startsWith(allowed.slice(0, -1));
        }
        return origin === allowed;
      });
      if (matched) return callback(null, true);
      callback(null, false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const port = parseInt(configService.get<string>('PORT', '3000'), 10);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`[MuteSound] backend listening on http://localhost:${port}/${apiPrefix}`);
}

bootstrap();
