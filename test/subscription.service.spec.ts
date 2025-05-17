import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionService } from '../src/subscription/subscription.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { EmailService } from '../src/email/email.service';
import { WeatherService } from '../src/weather/weather.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let prismaService: PrismaService;
  let emailService: EmailService;
  let weatherService: WeatherService;

  const mockPrismaService = {
    subscription: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockEmailService = {
    sendConfirmationEmail: jest.fn(),
  };

  const mockWeatherService = {
    getCurrentWeather: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: WeatherService,
          useValue: mockWeatherService,
        },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    prismaService = module.get<PrismaService>(PrismaService);
    emailService = module.get<EmailService>(EmailService);
    weatherService = module.get<WeatherService>(WeatherService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      email: 'test@example.com',
      city: 'London',
      frequency: 'daily',
    };

    it('should create a new subscription', async () => {
      mockWeatherService.getCurrentWeather.mockResolvedValueOnce({});
      mockPrismaService.subscription.findFirst.mockResolvedValueOnce(null);
      mockPrismaService.subscription.create.mockResolvedValueOnce({
        ...createDto,
        id: 1,
        token: expect.any(String),
        confirmed: false,
      });
      mockEmailService.sendConfirmationEmail.mockResolvedValueOnce(undefined);

      const result = await service.create(createDto);

      expect(result).toEqual({
        message: 'Subscription created. Please check your email to confirm.',
      });
      expect(mockPrismaService.subscription.create).toHaveBeenCalled();
      expect(mockEmailService.sendConfirmationEmail).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid city', async () => {
      mockWeatherService.getCurrentWeather.mockRejectedValueOnce(new Error());

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException for existing subscription', async () => {
      mockWeatherService.getCurrentWeather.mockResolvedValueOnce({});
      mockPrismaService.subscription.findFirst.mockResolvedValueOnce({
        ...createDto,
        confirmed: true,
      });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('confirm', () => {
    const token = uuidv4();

    it('should confirm subscription', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValueOnce({
        id: 1,
        token,
        confirmed: false,
      });
      mockPrismaService.subscription.update.mockResolvedValueOnce({
        id: 1,
        token,
        confirmed: true,
      });

      const result = await service.confirm(token);

      expect(result).toEqual({
        message: 'Subscription confirmed successfully',
      });
      expect(mockPrismaService.subscription.update).toHaveBeenCalled();
    });

    it('should return already confirmed message', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValueOnce({
        id: 1,
        token,
        confirmed: true,
      });

      const result = await service.confirm(token);

      expect(result).toEqual({
        message: 'Subscription already confirmed',
      });
    });

    it('should throw NotFoundException for invalid token', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValueOnce(null);

      await expect(service.confirm(token)).rejects.toThrow(NotFoundException);
    });
  });

  describe('unsubscribe', () => {
    const token = uuidv4();

    it('should unsubscribe successfully', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValueOnce({
        id: 1,
        token,
      });
      mockPrismaService.subscription.delete.mockResolvedValueOnce({
        id: 1,
        token,
      });

      const result = await service.unsubscribe(token);

      expect(result).toEqual({
        message: 'Unsubscribed successfully',
      });
      expect(mockPrismaService.subscription.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid token', async () => {
      mockPrismaService.subscription.findUnique.mockResolvedValueOnce(null);

      await expect(service.unsubscribe(token)).rejects.toThrow(NotFoundException);
    });
  });
}); 