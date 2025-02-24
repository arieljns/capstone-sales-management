import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BeforeMeetingModule } from './before-meeting/before-meeting.module';

@Module({
  imports: [BeforeMeetingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
