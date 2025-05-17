import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export enum Frequency {
  HOURLY = 'hourly',
  DAILY = 'daily',
}

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Email address to subscribe',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'City for weather updates',
    example: 'London',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'Frequency of updates',
    enum: Frequency,
    example: Frequency.DAILY,
  })
  @IsEnum(Frequency)
  @IsNotEmpty()
  frequency: Frequency;
}
