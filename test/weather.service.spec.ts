import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from '../src/weather/weather.service';
import axios from 'axios';
import { BadRequestException, NotFoundException } from '@nestjs/common';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WeatherService', () => {
  let service: WeatherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WeatherService],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    process.env.WEATHER_API_KEY = 'test_api_key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentWeather', () => {
    it('should return weather data for valid city', async () => {
      const mockWeatherData = {
        data: {
          current: {
            temp_c: 20,
            humidity: 65,
            condition: {
              text: 'Sunny',
            },
          },
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockWeatherData);

      const result = await service.getCurrentWeather('London');

      expect(result).toEqual({
        temperature: 20,
        humidity: 65,
        description: 'Sunny',
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('London'),
      );
    });

    it('should throw NotFoundException for invalid city', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 404 },
      });

      await expect(service.getCurrentWeather('InvalidCity')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error for API failure', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.getCurrentWeather('London')).rejects.toThrow('API Error');
    });
  });
}); 