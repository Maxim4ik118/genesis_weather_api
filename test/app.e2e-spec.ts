import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { WeatherService } from '../src/weather/weather.service';
import { EmailService } from '../src/email/email.service';
import { v4 as uuidv4 } from 'uuid';
import { SchedulerService } from '../src/scheduler/scheduler.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Mock services
  const mockWeatherService = {
    getCurrentWeather: jest.fn().mockImplementation((city: string) => {
      if (city === 'InvalidCity') {
        throw new Error('City not found');
      }
      return Promise.resolve({
        temperature: 20.5,
        humidity: 65,
        description: 'Partly cloudy',
      });
    }),
  };

  const mockEmailService = {
    sendConfirmationEmail: jest.fn().mockResolvedValue(undefined),
    sendWeatherUpdate: jest.fn().mockResolvedValue(undefined),
  };

  const mockSchedulerService = {
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(WeatherService)
      .useValue(mockWeatherService)
      .overrideProvider(EmailService)
      .useValue(mockEmailService)
      .overrideProvider(SchedulerService)
      .useValue(mockSchedulerService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe());
    
    // Get PrismaService instance
    prisma = app.get(PrismaService);
    
    await app.init();
  });

  beforeEach(async () => {
    // Clean the database before each test
    if (prisma) {
      await prisma.$transaction([
        prisma.weatherData.deleteMany(),
        prisma.subscription.deleteMany(),
      ]);
    }
    jest.clearAllMocks();
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.$transaction([
        prisma.weatherData.deleteMany(),
        prisma.subscription.deleteMany(),
      ]);
      await prisma.$disconnect();
    }
    if (app) {
      await app.close();
    }
  });

  describe('/api/weather (GET)', () => {
    it('should return weather data for a valid city', () => {
      return request(app.getHttpServer())
        .get('/api/weather')
        .query({ city: 'London' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('temperature', 20.5);
          expect(res.body).toHaveProperty('humidity', 65);
          expect(res.body).toHaveProperty('description', 'Partly cloudy');
        });
    });

    it('should return 400 when city is not provided', () => {
      return request(app.getHttpServer())
        .get('/api/weather')
        .expect(400);
    });

    it('should return 404 for invalid city', () => {
      return request(app.getHttpServer())
        .get('/api/weather')
        .query({ city: 'InvalidCity' })
        .expect(404);
    });
  });

  describe('/api/subscribe (POST)', () => {
    const validSubscription = {
      email: 'test@example.com',
      city: 'London',
      frequency: 'daily',
    };

    it('should create a new subscription', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/subscribe')
        .send(validSubscription)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Subscription created');

      // Verify database entry
      const subscription = await prisma.subscription.findFirst({
        where: { email: validSubscription.email },
      });
      expect(subscription).toBeTruthy();
      expect(subscription?.confirmed).toBe(false);

      // Verify email was sent
      expect(mockEmailService.sendConfirmationEmail).toHaveBeenCalled();
    });

    it('should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/subscribe')
        .send({ ...validSubscription, email: 'invalid-email' })
        .expect(400);
    });

    it('should return 400 for invalid frequency', () => {
      return request(app.getHttpServer())
        .post('/api/subscribe')
        .send({ ...validSubscription, frequency: 'invalid' })
        .expect(400);
    });

    it('should return 409 for duplicate subscription', async () => {
      // Create initial subscription
      await prisma.subscription.create({
        data: {
          ...validSubscription,
          token: uuidv4(),
          confirmed: true,
        },
      });

      // Try to create duplicate
      return request(app.getHttpServer())
        .post('/api/subscribe')
        .send(validSubscription)
        .expect(409);
    });
  });

  describe('/api/confirm/:token (GET)', () => {
    it('should confirm subscription with valid token', async () => {
      const token = uuidv4();
      await prisma.subscription.create({
        data: {
          email: 'test@example.com',
          city: 'London',
          frequency: 'daily',
          token,
          confirmed: false,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/api/confirm/${token}`)
        .expect(200);

      expect(response.body.message).toContain('confirmed successfully');

      // Verify database update
      const subscription = await prisma.subscription.findUnique({
        where: { token },
      });
      expect(subscription?.confirmed).toBe(true);
    });

    it('should return 404 for invalid token', () => {
      return request(app.getHttpServer())
        .get(`/api/confirm/${uuidv4()}`)
        .expect(404);
    });

    it('should handle already confirmed subscription', async () => {
      const token = uuidv4();
      await prisma.subscription.create({
        data: {
          email: 'test@example.com',
          city: 'London',
          frequency: 'daily',
          token,
          confirmed: true,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/api/confirm/${token}`)
        .expect(200);

      expect(response.body.message).toContain('already confirmed');
    });
  });

  describe('/api/unsubscribe/:token (GET)', () => {
    it('should unsubscribe with valid token', async () => {
      const token = uuidv4();
      await prisma.subscription.create({
        data: {
          email: 'test@example.com',
          city: 'London',
          frequency: 'daily',
          token,
          confirmed: true,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/api/unsubscribe/${token}`)
        .expect(200);

      expect(response.body.message).toContain('Unsubscribed successfully');

      // Verify subscription was deleted
      const subscription = await prisma.subscription.findUnique({
        where: { token },
      });
      expect(subscription).toBeNull();
    });

    it('should return 404 for invalid token', () => {
      return request(app.getHttpServer())
        .get(`/api/unsubscribe/${uuidv4()}`)
        .expect(404);
    });
  });
});
