import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { WeatherModule } from '../weather/weather.module';
import { EmailModule } from '../email/email.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [WeatherModule, EmailModule, PrismaModule],
  providers: [SchedulerService],
})
export class SchedulerModule {} 