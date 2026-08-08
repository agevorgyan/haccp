import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { Notification, NotificationType } from './entities/notification.entity';
import { PushSubscription } from './entities/push-subscription.entity';
import { NotificationsGateway } from './notifications.gateway';

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
    private readonly notificationsGateway: NotificationsGateway,
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
   * Main sendAlert method:
   * a) Save notification in database
   * b) Emit real-time event via Socket.io if user is online
   * c) Send Web Push notification to saved subscriptions for that user
   */
  async sendAlert(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.ALERT,
  ): Promise<Notification> {
    // a) Save in database
    const notification = this.notificationRepository.create({
      userId,
      title,
      message,
      type,
      isRead: false,
    });
    const saved = await this.notificationRepository.save(notification);

    // b) Emit real-time WebSocket event
    this.notificationsGateway.sendRealTimeNotification(userId, saved);

    // c) Send Web Push notification
    this.dispatchWebPushNotification(userId, {
      id: saved.id,
      title: saved.title,
      message: saved.message,
      type: saved.type,
      createdAt: saved.createdAt,
    });

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
            // Subscription expired or invalid; remove from DB
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
}
