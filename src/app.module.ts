import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BeforeMeetingModule } from './before-meeting/before-meeting.module';
import { AfterMeetingModule } from './after-meeting/after-meeting.module';
import { dataSourceOptions } from 'db/data-source';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormBuilderModule } from './form-builder/form-builder.module';
import { KanbanTicketModule } from './kanban-ticket/kanban-ticket.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RolesGuard } from './auth/guards/roles.guards';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guards';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(dataSourceOptions),
    BeforeMeetingModule,
    AfterMeetingModule,
    FormBuilderModule,
    KanbanTicketModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


