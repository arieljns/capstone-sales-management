export type ErrorSeverity = 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface SystemError {
  code: string;
  message: string;
  statusCode: number;
  severity: ErrorSeverity;
  isOperational: boolean;
  cause?: unknown;
  context?: Record<string, any>;
}
