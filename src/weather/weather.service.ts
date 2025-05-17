import { Injectable, NotFoundException } from '@nestjs/common';
import { WeatherResponse } from './interfaces/weather.interface';
import axios from 'axios';

@Injectable()
export class WeatherService {
  private readonly apiKey = process.env.WEATHER_API_KEY;
  private readonly apiUrl = 'http://api.weatherapi.com/v1';

  async getCurrentWeather(city: string): Promise<WeatherResponse> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/current.json?key=${this.apiKey}&q=${encodeURIComponent(city)}`,
      );

      const { current } = response.data;
      return {
        temperature: current.temp_c,
        humidity: current.humidity,
        description: current.condition.text,
      };
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException('City not found');
      }
      throw error;
    }
  }
}
