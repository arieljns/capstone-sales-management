import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AirtableService } from './airtable.service';
import { AirtableController } from './airtable.controller';

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      baseURL: 'https://api.airtable.com/v0',
      timeout: 8000,
    }),
  ],
  providers: [AirtableService],
  controllers: [AirtableController],
  exports: [AirtableService],
})
export class AirtableModule {}
