import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GetWeatherDto {
  @ApiProperty({
    description: 'City name for weather forecast',
    example: 'London',
  })
  @IsString()
  @IsNotEmpty()
  city: string;
}
