import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { GlobalExceptionFilter } from './common/exceptionFilter/global-exception-filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const logger = app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.use(new GlobalExceptionFilter(logger));

  app.enableCors({
    origin: '*',
    methods: 'GET, DELETE, PUT, POST, HEAD, PATCH',
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
