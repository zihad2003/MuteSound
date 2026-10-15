import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorPayload {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred.';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resp = exception.getResponse() as
        | string
        | { message?: string | string[]; error?: string; code?: string; details?: unknown };

      if (typeof resp === 'string') {
        message = resp;
      } else {
        const rawMsg = resp.message;
        if (Array.isArray(rawMsg)) {
          message = rawMsg.join('; ');
          code = (resp.code as string) ?? 'VALIDATION_ERROR';
          details = rawMsg;
        } else if (typeof rawMsg === 'string') {
          message = rawMsg;
          code = (resp.code as string) ?? this.defaultCodeForStatus(status);
        }
        if (resp.details) details = resp.details;
        if (resp.error && !code) code = (resp.error as string).toUpperCase().replace(/\s+/g, '_');
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    if (!code || code === 'INTERNAL_ERROR') {
      code = this.defaultCodeForStatus(status);
    }

    const body: ErrorPayload = { error: { code, message } };
    if (details !== undefined) (body.error as ErrorPayload['error'] & { details?: unknown }).details = details;

    res.status(status).json(body);
  }

  private defaultCodeForStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'TOO_MANY_REQUESTS';
      default:
        return 'INTERNAL_ERROR';
    }
  }
}
