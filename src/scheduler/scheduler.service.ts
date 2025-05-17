import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WeatherService } from '../weather/weather.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly hourlyInterval = 60 * 60 * 1000; // 1 hour
  private readonly dailyInterval = 24 * 60 * 60 * 1000; // 24 hours

  constructor(
    private readonly prisma: PrismaService,
    private readonly weatherService: WeatherService,
    private readonly emailService: EmailService,
  ) {}

  async onModuleInit() {
    // Start both hourly and daily update jobs
    this.startHourlyUpdates();
    this.startDailyUpdates();
    
    // Run initial updates
    await this.sendUpdates('hourly');
    await this.sendUpdates('daily');
  }

  private startHourlyUpdates() {
    setInterval(async () => {
      await this.sendUpdates('hourly');
    }, this.hourlyInterval);
  }

  private startDailyUpdates() {
    setInterval(async () => {
      await this.sendUpdates('daily');
    }, this.dailyInterval);
  }

  private async sendUpdates(frequency: 'hourly' | 'daily') {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        frequency,
        confirmed: true,
      },
    });

    for (const subscription of subscriptions) {
      try {
        const weatherData = await this.weatherService.getCurrentWeather(subscription.city);
        
        // Add token to weather data for unsubscribe link
        const weatherDataWithToken = {
          ...weatherData,
          token: subscription.token,
        };

        await this.emailService.sendWeatherUpdate(
          subscription.email,
          subscription.city,
          weatherDataWithToken
        );
        
        // Store weather data
        await this.prisma.weatherData.create({
          data: {
            city: subscription.city,
            temperature: weatherData.temperature,
            humidity: weatherData.humidity,
            description: weatherData.description,
          },
        });
      } catch (error) {
        console.error(`Failed to send weather update for ${subscription.email}:`, error);
      }
    }
  }
} 