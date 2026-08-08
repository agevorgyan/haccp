import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NotificationType } from './entities/notification.entity';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('vapid-public-key')
  getVapidPublicKey() {
    return this.notificationsService.getVapidPublicKey();
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMyNotifications(@Req() req: any) {
    const userId = req.user.userId;
    return this.notificationsService.getNotificationsForUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read-all')
  async markAllAsRead(@Req() req: any) {
    const userId = req.user.userId;
    return this.notificationsService.markAllAsRead(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  async markAsRead(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.notificationsService.markAsRead(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  @HttpCode(HttpStatus.CREATED)
  async subscribePush(@Req() req: any, @Body() subscriptionData: Record<string, any>) {
    const userId = req.user.userId;
    return this.notificationsService.savePushSubscription(userId, subscriptionData);
  }

  @UseGuards(JwtAuthGuard)
  @Post('test-alert')
  @HttpCode(HttpStatus.OK)
  async sendTestAlert(
    @Req() req: any,
    @Body() body: { title?: string; message?: string; type?: NotificationType },
  ) {
    const userId = req.user.userId;
    const title = body.title || 'CCP Critical Breach Alert';
    const message =
      body.message ||
      'Walk-In Fridge 1 temperature exceeded safe threshold (+7.8°C). Immediate action required.';
    const type = body.type || NotificationType.ALERT;

    return this.notificationsService.sendAlert(userId, title, message, type);
  }
}
