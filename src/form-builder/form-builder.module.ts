import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeforeMeetingEntity } from 'src/before-meeting/before-meeting.entities';
import { AfterMeetingEntity } from 'src/after-meeting/after-meeting.entities';
import { FormBuilderService } from './form-builder.service';
import { FormBuilderController } from './form-builder.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([BeforeMeetingEntity, AfterMeetingEntity]),
  ],
  controllers: [FormBuilderController],
  providers: [FormBuilderService],
})
export class FormBuilderModule {}
