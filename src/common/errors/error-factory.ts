import { AppError } from './app-error';
import { ErrorCodes } from './error-codes';

export class ErrorFactory {
  static authInvalidToken(cause?: Error) {
    return new AppError({
      ...ErrorCodes.AUTH_INVALID_TOKEN,
      message: 'JWT validation failed: invalid signature',
      cause,
    });
  }

  static userNotFound(userId: string) {
    return new AppError({
      ...ErrorCodes.USER_NOT_FOUND,
      message: `User ${userId} does not exist`,
      metadata: { userId },
    });
  }

  static internal(cause: Error) {
    return new AppError({
      ...ErrorCodes.INTERNAL_ERROR,
      message: cause.message,
      cause,
      isOperational: false,
    });
  }

  static resourceNotFound(resource: string, metadata?: Record<string, any>) {
    return new AppError({
      ...ErrorCodes.RESOURCE_NOT_FOUND,
      message: `${resource} not found`,
      metadata,
    });
  }
}
