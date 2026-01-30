import * as winston from 'winston';
import { utilities as nestWinstonModuleUtils } from 'nest-winston';

export const winstonConfig: winston.LoggerOptions = {
  level: 'info',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        nestWinstonModuleUtils.format.nestLike(),
      ),
    }),
  ],
};
