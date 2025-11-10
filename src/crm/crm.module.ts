import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CrmService } from './crm.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      baseURL: 'https://api.hubapi.com',
      timeout: 5000,
    }),
  ],
  providers: [CrmService],
  exports: [CrmService],
})
export class CrmModule {}
