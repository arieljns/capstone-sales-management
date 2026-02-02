import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from 'winston';
import { normalizeError } from '../errors/normalize-error';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const errorContext = {
      requestId: request.headers['x-request-id'],
      path: request.url,
      method: request.method,
      userId: (request as any).user?.id,
    };

    const systemError = normalizeError(exception, errorContext);

    this.logger.log(systemError.severity.toLowerCase(), systemError.message, {
      code: systemError.code,
      stack:
        systemError.cause instanceof Error
          ? systemError.cause.stack
          : undefined,
      context: systemError.context,
    });

    response.status(systemError.statusCode).json({
      code: systemError.code,
      message: systemError.message,
      requestId: errorContext.requestId,
    });
  }
}
