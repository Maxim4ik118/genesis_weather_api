import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@ApiTags('subscription')
@Controller()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to weather updates' })
  @ApiResponse({ status: 200, description: 'Subscription successful' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Email already subscribed' })
  async subscribe(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionService.create(createSubscriptionDto);
  }

  @Get('confirm/:token')
  @ApiOperation({ summary: 'Confirm email subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription confirmed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  async confirm(@Param('token') token: string) {
    return this.subscriptionService.confirm(token);
  }

  @Get('unsubscribe/:token')
  @ApiOperation({ summary: 'Unsubscribe from weather updates' })
  @ApiResponse({ status: 200, description: 'Unsubscribed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  async unsubscribe(@Param('token') token: string) {
    return this.subscriptionService.unsubscribe(token);
  }
}
