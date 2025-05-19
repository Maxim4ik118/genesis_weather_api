import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerService } from '../src/scheduler/scheduler.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { WeatherService } from '../src/weather/weather.service';
import { EmailService } from '../src/email/email.service';

describe('SchedulerService', () => {
  let service: SchedulerService;
  let prismaService: PrismaService;
  let weatherService: WeatherService;
  let emailService: EmailService;

  const mockPrismaService = {
    subscription: {
      findMany: jest.fn(),
    },
    weatherData: {
      create: jest.fn(),
    },
  };

  const mockWeatherService = {
    getCurrentWeather: jest.fn(),
  };

  const mockEmailService = {
    sendWeatherUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: WeatherService,
          useValue: mockWeatherService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<SchedulerService>(SchedulerService);
    prismaService = module.get<PrismaService>(PrismaService);
    weatherService = module.get<WeatherService>(WeatherService);
    emailService = module.get<EmailService>(EmailService);

    // Mock setInterval to prevent actual scheduling
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('sendUpdates', () => {
    const mockSubscriptions = [
      {
        id: 1,
        email: 'test1@example.com',
        city: 'London',
        frequency: 'hourly',
        token: 'token1',
        confirmed: true,
      },
      {
        id: 2,
        email: 'test2@example.com',
        city: 'Paris',
        frequency: 'daily',
        token: 'token2',
        confirmed: true,
      },
    ];

    const mockWeatherData = {
      temperature: 20,
      humidity: 65,
      description: 'Sunny',
    };

    it('should send updates to subscribed users', async () => {
      mockPrismaService.subscription.findMany.mockResolvedValueOnce(mockSubscriptions);
      mockWeatherService.getCurrentWeather.mockResolvedValue(mockWeatherData);
      mockEmailService.sendWeatherUpdate.mockResolvedValue(undefined);
      mockPrismaService.weatherData.create.mockResolvedValue({ id: 1, ...mockWeatherData });

      await (service as any).sendUpdates('hourly');

      expect(mockPrismaService.subscription.findMany).toHaveBeenCalledWith({
        where: {
          frequency: 'hourly',
          confirmed: true,
        },
      });

      expect(mockWeatherService.getCurrentWeather).toHaveBeenCalledTimes(mockSubscriptions.length);
      expect(mockEmailService.sendWeatherUpdate).toHaveBeenCalledTimes(mockSubscriptions.length);
      expect(mockPrismaService.weatherData.create).toHaveBeenCalledTimes(mockSubscriptions.length);
    });

    it('should handle errors for individual subscriptions', async () => {
      mockPrismaService.subscription.findMany.mockResolvedValueOnce(mockSubscriptions);
      mockWeatherService.getCurrentWeather.mockRejectedValueOnce(new Error('API Error'));
      
      // Call private method using any type assertion
      await (service as any).sendUpdates('daily');

      expect(mockEmailService.sendWeatherUpdate).not.toHaveBeenCalled();
      expect(mockPrismaService.weatherData.create).not.toHaveBeenCalled();
    });
  });

  describe('scheduling', () => {
    it('should start both hourly and daily updates on init', async () => {
      const sendUpdatesSpy = jest.spyOn(service as any, 'sendUpdates');
      
      await service.onModuleInit();

      expect(sendUpdatesSpy).toHaveBeenCalledWith('hourly');
      expect(sendUpdatesSpy).toHaveBeenCalledWith('daily');

      // Verify that intervals are set
      jest.advanceTimersByTime(60 * 60 * 1000); // 1 hour
      expect(sendUpdatesSpy).toHaveBeenCalledTimes(4); // 2 initial + 1 hourly

      jest.advanceTimersByTime(24 * 60 * 60 * 1000); // 24 hours
      expect(sendUpdatesSpy).toHaveBeenCalledTimes(28); // Previous + 24 hourly + 1 daily
    });
  });
}); 