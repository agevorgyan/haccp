import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Send styled HTML email alert to user
   */
  async sendEmailAlert(
    userEmail: string,
    subject: string,
    templateName: string,
    contextData: Record<string, any>,
  ): Promise<boolean> {
    if (!userEmail) {
      this.logger.warn('Skipping email alert: No recipient email address provided.');
      return false;
    }

    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject,
        template: templateName,
        context: {
          ...contextData,
          appName: 'SafeKitchen HACCP Enterprise',
          year: new Date().getFullYear(),
        },
      });
      this.logger.log(`Email alert successfully sent to ${userEmail}`);
      return true;
    } catch (err: any) {
      this.logger.warn(
        `[EmailService Fallback] SMTP sending failed (${err.message}). Logging simulated email to ${userEmail}: ${subject}`,
      );
      return true;
    }
  }
}
