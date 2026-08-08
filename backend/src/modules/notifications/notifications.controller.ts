import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService, NotificationChannel } from './notifications.service';
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
  @Get('preferences')
  async getPreferences(@Req() req: any) {
    const userId = req.user.userId;
    return this.notificationsService.getUserPreferences(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('preferences')
  async updatePreferences(
    @Req() req: any,
    @Body()
    body: {
      email?: string;
      preferences?: { inApp: boolean; push: boolean; email: boolean; telegram: boolean };
    },
  ) {
    const userId = req.user.userId;
    return this.notificationsService.updateUserPreferences(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('telegram/generate-link')
  @HttpCode(HttpStatus.OK)
  async generateTelegramLinkCode(@Req() req: any) {
    const userId = req.user.userId;
    return this.notificationsService.generateTelegramLinkCode(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('telegram/disconnect')
  @HttpCode(HttpStatus.OK)
  async disconnectTelegram(@Req() req: any) {
    const userId = req.user.userId;
    return this.notificationsService.disconnectTelegram(userId);
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
    @Body()
    body: {
      title?: string;
      message?: string;
      type?: NotificationType;
      channels?: NotificationChannel[];
    },
  ) {
    const userId = req.user.userId;
    const title = body.title || 'CCP Critical Breach Alert';
    const message =
      body.message ||
      'Walk-In Fridge 1 temperature exceeded safe threshold (+7.8°C). Immediate action required.';
    const type = body.type || NotificationType.ALERT;
    const channels = body.channels || ['APP', 'PUSH', 'EMAIL', 'TELEGRAM'];

    return this.notificationsService.sendAlert(userId, title, message, type, channels);
  }
}
