import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private bot: Telegraf | null = null;
  private botUsername: string = 'SafeKitchenHACCPBot';

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token || token === 'YOUR_TELEGRAM_BOT_TOKEN') {
      this.logger.warn(
        'TELEGRAM_BOT_TOKEN is not configured. Telegram bot alerts will run in simulation mode.',
      );
      return;
    }

    try {
      this.bot = new Telegraf(token);

      // Welcome command handler
      this.bot.start((ctx) => {
        ctx.reply(
          '👋 Welcome to SafeKitchen HACCP Bot!\n\nPlease enter the 6-digit linking code generated in your app settings to connect your account.',
        );
      });

      // Handle 6-digit numeric verification code
      this.bot.on('text', async (ctx) => {
        const text = ctx.message.text.trim();
        const chatId = String(ctx.chat.id);

        if (/^\d{6}$/.test(text)) {
          const user = await this.userRepository.findOne({
            where: { telegramLinkCode: text },
          });

          if (user) {
            user.telegramChatId = chatId;
            user.telegramLinkCode = undefined as any;
            await this.userRepository.save(user);

            ctx.reply(
              `✅ Account Successfully Linked!\n\nHello ${user.firstName} ${user.lastName}! You will now receive instant HACCP compliance alerts in this chat.`,
            );
            this.logger.log(`Linked Telegram chatId ${chatId} to user ${user.id}`);
          } else {
            ctx.reply(
              '❌ Invalid or expired linking code. Please click "Connect Telegram" in the SafeKitchen app to generate a fresh code.',
            );
          }
        }
      });

      // Launch bot polling non-blockingly
      this.bot
        .launch()
        .then(() => {
          this.logger.log('Telegram Bot initialized and polling active.');
        })
        .catch((err) => {
          this.logger.warn(`Failed to launch Telegram bot polling: ${err.message}`);
        });
    } catch (err: any) {
      this.logger.warn(`Telegram Bot initialization error: ${err.message}`);
    }
  }

  onModuleDestroy() {
    if (this.bot) {
      try {
        this.bot.stop('Module Destroyed');
      } catch {
        // ignore
      }
    }
  }

  /**
   * Generate a unique 6-digit code for linking user's Telegram account
   */
  async generateLinkCode(userId: string): Promise<{ code: string; botUsername: string }> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (user) {
      user.telegramLinkCode = code;
      await this.userRepository.save(user);
    }

    const botName = this.configService.get<string>(
      'TELEGRAM_BOT_USERNAME',
      this.botUsername,
    );

    return { code, botUsername: botName };
  }

  /**
   * Unlink user's Telegram account
   */
  async unlinkTelegram(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.telegramChatId = undefined as any;
      user.telegramLinkCode = undefined as any;
      await this.userRepository.save(user);
      return true;
    }
    return false;
  }

  /**
   * Dispatches Markdown-formatted alert message to user's Telegram chat
   */
  async sendTelegramAlert(chatId: string, title: string, message: string): Promise<boolean> {
    if (!chatId) return false;

    const formattedMessage = `🚨 *SAFEKITCHEN HACCP ALERT*\n\n*${title}*\n${message}\n\n_Sent at: ${new Date().toLocaleTimeString()}_`;

    if (this.bot) {
      try {
        await this.bot.telegram.sendMessage(chatId, formattedMessage, {
          parse_mode: 'Markdown',
        });
        this.logger.log(`Telegram alert sent to chatId ${chatId}`);
        return true;
      } catch (err: any) {
        this.logger.warn(`Failed to send Telegram alert to ${chatId}: ${err.message}`);
      }
    }

    // Simulation log fallback if bot instance not running with live token
    this.logger.log(`[Telegram Simulation] Alert dispatched to chatId ${chatId}: ${title}`);
    return true;
  }
}
