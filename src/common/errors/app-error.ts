export class AppError extends Error {
  readonly code: string;
  readonly httpStatus: number;
  readonly publicMessage: string;
  readonly isOperational: boolean;
  readonly metadata?: Record<string, any>;
  readonly cause?: Error;

  constructor(params: {
    code: string;
    message: string;
    publicMessage: string;
    httpStatus: number;
    isOperational?: boolean;
    metadata?: Record<string, any>;
    cause?: Error;
  }) {
    super(params.message);

    this.code = params.code;
    this.httpStatus = params.httpStatus;
    this.publicMessage = params.publicMessage;
    this.isOperational = params.isOperational ?? true;
    this.metadata = params.metadata;
    this.cause = params.cause;

    Error.captureStackTrace(this, this.constructor);
  }
}
