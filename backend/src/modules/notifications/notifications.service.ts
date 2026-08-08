import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { Notification, NotificationType } from './entities/notification.entity';
import { PushSubscription } from './entities/push-subscription.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsGateway } from './notifications.gateway';
import { EmailService } from './email.service';
import { TelegramService } from './telegram.service';

export type NotificationChannel = 'APP' | 'PUSH' | 'EMAIL' | 'TELEGRAM';

// Standard VAPID fallback pair for dev environments
const DEFAULT_VAPID_PUBLIC_KEY =
  'BC-P7tG3wM7x2z9R6X8Q5V4Y3Z2A1B0C9D8E7F6G5H4I3J2K1L0M9N8O7P6Q5R4S3T2U1V0W9X8Y7Z6A5B4C3D2E1';
const DEFAULT_VAPID_PRIVATE_KEY = 'v1w2x3y4z5a6b7c8d9e0f1g2h3i4j5k6';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private vapidPublicKey: string;
  private vapidPrivateKey: string;

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(PushSubscription)
    private readonly pushSubscriptionRepository: Repository<PushSubscription>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly emailService: EmailService,
    private readonly telegramService: TelegramService,
    private readonly configService: ConfigService,
  ) {
    this.vapidPublicKey = this.configService.get<string>(
      'VAPID_PUBLIC_KEY',
      DEFAULT_VAPID_PUBLIC_KEY,
    );
    this.vapidPrivateKey = this.configService.get<string>(
      'VAPID_PRIVATE_KEY',
      DEFAULT_VAPID_PRIVATE_KEY,
    );

    const subject = this.configService.get<string>(
      'VAPID_SUBJECT',
      'mailto:admin@safekitchen.app',
    );

    try {
      webpush.setVapidDetails(subject, this.vapidPublicKey, this.vapidPrivateKey);
    } catch (err: any) {
      this.logger.warn(`Failed to initialize Web Push VAPID details: ${err.message}`);
    }
  }

  getVapidPublicKey(): { publicKey: string } {
    return { publicKey: this.vapidPublicKey };
  }

  /**
   * Unified Multi-Channel sendAlert:
   * Concurrently dispatches messages across requested and enabled channels:
   * - APP (In-App DB & WebSocket)
   * - PUSH (Browser PushManager)
   * - EMAIL (HTML SMTP Email)
   * - TELEGRAM (Telegram Bot Markdown Alert)
   */
  async sendAlert(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.ALERT,
    requestedChannels?: NotificationChannel[],
  ): Promise<Notification> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    // Always save In-App notification record
    const notification = this.notificationRepository.create({
      userId,
      title,
      message,
      type,
      isRead: false,
    });
    const saved = await this.notificationRepository.save(notification);

    const activeChannels = requestedChannels && requestedChannels.length > 0
      ? requestedChannels
      : ['APP', 'PUSH', 'EMAIL', 'TELEGRAM'];

    const prefs = user?.notificationPreferences || {
      inApp: true,
      push: true,
      email: true,
      telegram: true,
    };

    const dispatchPromises: Promise<any>[] = [];

    // 1. Channel: APP (WebSocket Live Stream)
    if (activeChannels.includes('APP') && prefs.inApp) {
      this.notificationsGateway.sendRealTimeNotification(userId, saved);
    }

    // 2. Channel: PUSH (Browser OS Push)
    if (activeChannels.includes('PUSH') && prefs.push) {
      dispatchPromises.push(
        this.dispatchWebPushNotification(userId, {
          id: saved.id,
          title: saved.title,
          message: saved.message,
          type: saved.type,
          createdAt: saved.createdAt,
        }),
      );
    }

    // 3. Channel: EMAIL (HTML Email Alert)
    if (activeChannels.includes('EMAIL') && prefs.email && user?.email) {
      dispatchPromises.push(
        this.emailService.sendEmailAlert(user.email, title, 'alert', {
          title,
          message,
          type,
        }),
      );
    }

    // 4. Channel: TELEGRAM (Telegram Bot Alert)
    if (activeChannels.includes('TELEGRAM') && prefs.telegram && user?.telegramChatId) {
      dispatchPromises.push(
        this.telegramService.sendTelegramAlert(user.telegramChatId, title, message),
      );
    }

    await Promise.allSettled(dispatchPromises);
    return saved;
  }

  private async dispatchWebPushNotification(userId: string, payload: any) {
    try {
      const subscriptions = await this.pushSubscriptionRepository.find({
        where: { userId },
      });

      if (subscriptions.length === 0) {
        return;
      }

      const pushPayload = JSON.stringify(payload);

      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification(sub.subscriptionData as any, pushPayload);
          this.logger.log(`Web Push delivered to user ${userId}`);
        } catch (err: any) {
          this.logger.warn(`Failed to deliver Web Push to subscription: ${err.message}`);
          if (err.statusCode === 404 || err.statusCode === 410) {
            await this.pushSubscriptionRepository.remove(sub);
          }
        }
      }
    } catch (err: any) {
      this.logger.error(`Error dispatching Web Push for user ${userId}: ${err.message}`);
    }
  }

  async getNotificationsForUser(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markAsRead(userId: string, notificationId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${notificationId} not found.`);
    }

    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<{ success: boolean; updatedCount: number }> {
    const result = await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return { success: true, updatedCount: result.affected || 0 };
  }

  async savePushSubscription(
    userId: string,
    subscriptionData: Record<string, any>,
  ): Promise<PushSubscription> {
    const endpoint = subscriptionData?.endpoint;
    if (!endpoint) {
      throw new Error('Invalid push subscription: Missing endpoint.');
    }

    let existing = await this.pushSubscriptionRepository.findOne({
      where: { userId },
    });

    if (existing) {
      existing.subscriptionData = subscriptionData;
      return this.pushSubscriptionRepository.save(existing);
    }

    const newSub = this.pushSubscriptionRepository.create({
      userId,
      subscriptionData,
    });
    return this.pushSubscriptionRepository.save(newSub);
  }

  async getUserPreferences(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    return {
      email: user.email || '',
      isTelegramConnected: !!user.telegramChatId,
      telegramChatId: user.telegramChatId || null,
      preferences: user.notificationPreferences || {
        inApp: true,
        push: true,
        email: true,
        telegram: true,
      },
    };
  }

  async updateUserPreferences(
    userId: string,
    body: {
      email?: string;
      preferences?: { inApp: boolean; push: boolean; email: boolean; telegram: boolean };
    },
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    if (body.email !== undefined) {
      user.email = body.email;
    }

    if (body.preferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...body.preferences,
      };
    }

    await this.userRepository.save(user);

    return this.getUserPreferences(userId);
  }

  async generateTelegramLinkCode(userId: string) {
    return this.telegramService.generateLinkCode(userId);
  }

  async disconnectTelegram(userId: string) {
    await this.telegramService.unlinkTelegram(userId);
    return { success: true };
  }
}
