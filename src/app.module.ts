import { Module } from '@nestjs/common';
import { PrismaModule } from '@app/prisma/prisma.module';
import { WeatherModule } from './weather/weather.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    PrismaModule,
    WeatherModule,
    SubscriptionModule,
    SchedulerModule,
    EmailModule,
  ],
})
export class AppModule {}
