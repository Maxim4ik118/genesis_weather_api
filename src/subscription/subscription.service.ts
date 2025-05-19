import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { WeatherService } from '../weather/weather.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly weatherService: WeatherService,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto) {
    const { email, city, frequency } = createSubscriptionDto;

    try {
      await this.weatherService.getCurrentWeather(city);
    } catch (error) {
      throw new BadRequestException('Invalid city. Unable to fetch weather data.');
    }

    const existing = await this.prisma.subscription.findFirst({
      where: { email, city },
    });

    if (existing) {
      if (existing.confirmed) {
        throw new ConflictException('Email already subscribed for this city');
      } else {
        // If there's an unconfirmed subscription, delete it and create a new one
        await this.prisma.subscription.delete({
          where: { id: existing.id },
        });
      }
    }

    const token = uuidv4();

    const subscription = await this.prisma.subscription.create({
      data: {
        email,
        city,
        frequency,
        token,
        confirmed: false,
      },
    });

    try {
      await this.emailService.sendConfirmationEmail(email, city, token);
    } catch (error) {
      // If email sending fails, delete the subscription and throw error
      await this.prisma.subscription.delete({
        where: { id: subscription.id },
      });
      throw new Error('Failed to send confirmation email. Please try again later.');
    }

    return {
      message: 'Subscription created. Please check your email to confirm.',
    };
  }

  async confirm(token: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { token },
    });

    if (!subscription) {
      throw new NotFoundException('Token not found');
    }

    if (subscription.confirmed) {
      return { message: 'Subscription already confirmed' };
    }

    await this.prisma.subscription.update({
      where: { token },
      data: { confirmed: true },
    });

    return { message: 'Subscription confirmed successfully' };
  }

  async unsubscribe(token: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { token },
    });

    if (!subscription) {
      throw new NotFoundException('Token not found');
    }

    await this.prisma.subscription.delete({
      where: { token },
    });

    return { message: 'Unsubscribed successfully' };
  }
}
