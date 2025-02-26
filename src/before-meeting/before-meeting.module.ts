import { Module } from '@nestjs/common';
import { BeforeMeetingController } from './before-meeting.controller';
import { BeforeMeetingService } from './before-meeting.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/data-source';
import { BeforeMeetingEntity } from './before-meeting.entities'
@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature([BeforeMeetingEntity]),
  ],
  controllers: [BeforeMeetingController],
  providers: [BeforeMeetingService],
})
export class BeforeMeetingModule {}
