import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { GetWeatherDto } from './dto/get-weather.dto';
import { WeatherResponse } from './interfaces/weather.interface';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  @ApiOperation({ summary: 'Get current weather for a city' })
  @ApiResponse({ status: 200, description: 'Returns current weather forecast' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 404, description: 'City not found' })
  async getWeather(
    @Query() getWeatherDto: GetWeatherDto,
  ): Promise<WeatherResponse> {
    try {
      return await this.weatherService.getCurrentWeather(getWeatherDto.city);
    } catch (error) {
      if (error.message === 'City not found') {
        throw new NotFoundException('City not found');
      }
      throw error;
    }
  }
}
