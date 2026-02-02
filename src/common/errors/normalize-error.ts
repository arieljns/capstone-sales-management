import { HttpException } from '@nestjs/common';
import { SystemError } from './error-interface';

export function normalizeError(
  exception: unknown,
  context: Record<string, any> = {},
): SystemError {
  if (exception instanceof HttpException) {
    const status = exception.getStatus();

    return {
      code: `HTTP-${status}`,
      message: exception.message,
      statusCode: status,
      severity: status >= 500 ? 'ERROR' : 'WARN',
      isOperational: true,
      cause: exception,
      context,
    };
  }

  if (exception instanceof Error) {
    return {
      code: 'UNEXPECTED_ERROR',
      message: 'Internal server error',
      statusCode: 500,
      severity: 'ERROR',
      isOperational: false,
      cause: exception,
      context,
    };
  }

  return {
    code: 'UNKNOWN_THROWABLE',
    message: 'Internal server error',
    statusCode: 500,
    severity: 'ERROR',
    isOperational: false,
    cause: exception,
    context,
  };
}
